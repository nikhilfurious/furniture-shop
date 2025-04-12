const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts,rgb } = require("pdf-lib");
const Orders = require('../models/Orders');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Update user's phone number
router.post('/update-user-details', async (req, res) => {
    try {
        const { userId, phoneNumber, address } = req.body;

        if (!userId || !phoneNumber) {
            return res.status(400).json({ success: false, message: "User ID and phone number are required" });
        }

        // Find user by Firebase UID
        const existingUser = await User.findOne({ firebaseUID: userId });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Update phone number and address
        existingUser.phoneNumber = phoneNumber;
        
        if (address) {
            existingUser.address = address;
        }

        await existingUser.save();

        res.json({ success: true, user: existingUser, message: "User details updated successfully" });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ success: false, message: 'Failed to update user details' });
    }
});


router.get('/get-user-details', async (req, res) => {
    try {
      const { userId } = req.query;
  
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required' });
      }
  
      // Fetch user details from the database
      const user = await User.findOne({firebaseUID: userId});
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Send the user details as a response
      res.json({
        success: true,
        userDetails: {
          phoneNumber: user.phoneNumber || '+91',
          address: user.address || '',
        },
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  

// Process purchase and generate invoice



router.post("/process-purchase", async (req, res) => {
    try {
        const { userId, totalAmount,products, customer, adminEmail } = req.body;
        
        const invoiceNumber = `INV-${Date.now().toString().substr(-6)}`;
        const today = new Date();
        // Example date format: 27th Feb 2025 (customize as needed)
        const date = today.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
    
        // --- 1) Create a new PDF document ---
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4 size
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
        // Colors & positions
        const textColor = rgb(0, 0, 0); // Black
        const marginLeft = 50;
        let yPos = 780; 
        const lineHeight = 15;
    
        page.setFont(helveticaFont);
        page.setFontSize(12);
    
        // --- 2) Header: "Spot Furnish Rentals" + Address + Phones ---
        page.setFontSize(16);
        page.drawText("Spot Furnish Rentals", {
          x: marginLeft,
          y: yPos,
          color: textColor,
        });
    
        page.setFontSize(12);
        yPos -= lineHeight;
        page.drawText("8th Main, Ramamurthy Nagar main Road", {
          x: marginLeft,
          y: yPos,
          color: textColor,
        });
    
        yPos -= lineHeight;
        page.drawText("Bengaluru, Karnataka 560016", {
          x: marginLeft,
          y: yPos,
          color: textColor,
        });
    
        yPos -= lineHeight;
        page.drawText("+91 8123096928 | +91 9844311785", {
          x: marginLeft,
          y: yPos,
          color: textColor,
        });
    
        // --- 3) Quotation / Invoice Title & Date ---
        yPos -= (lineHeight * 2);
        page.setFontSize(14);
        page.drawText("Quotation", {
          x: marginLeft,
          y: yPos,
          color: textColor,
        });
    
        yPos -= lineHeight;
        page.drawText(`Date: ${date}`, {
          x: marginLeft,
          y: yPos,
          color: textColor,
        });
    
        // Example: If you want to show "To: Some Company Name"
        // yPos -= lineHeight;
        // page.drawText(`To: ${customer.company ?? "Client Company"}`, {
        //   x: marginLeft,
        //   y: yPos,
        //   color: textColor,
        // });
    
        // --- 4) Table / Items Section ---
        // Adjust as per your needs, e.g., Premium Office Chair, monthly rent, etc.
        yPos -= (lineHeight * 2);
        const tableHeaderX = [50, 250, 350, 450];
        page.drawText("Item Description", { x: tableHeaderX[0], y: yPos });
        page.drawText("Price", { x: tableHeaderX[1], y: yPos });
        page.drawText("Quantity", { x: tableHeaderX[2], y: yPos });
        page.drawText("Total", { x: tableHeaderX[3], y: yPos });
    
        yPos -= (lineHeight + 5);
        page.drawLine({
          start: { x: 50, y: yPos },
          end: { x: 545, y: yPos },
          thickness: 1,
          color: textColor,
        });
        yPos -= 10;
    
        // Helper to wrap text for item name, if needed
        function drawWrappedText(text, x, y, maxWidth) {
          const words = text.split(" ");
          let line = "";
          let linesUsed = 0;
    
          for (let word of words) {
            const testLine = line ? `${line} ${word}` : word;
            const width = helveticaFont.widthOfTextAtSize(testLine, 12);
            if (width > maxWidth) {
              page.drawText(line, { x, y: y - (linesUsed * lineHeight) });
              line = word;
              linesUsed += 1;
            } else {
              line = testLine;
            }
          }
    
          if (line) {
            page.drawText(line, { x, y: y - (linesUsed * lineHeight) });
          }
          return linesUsed * lineHeight;
        }
    
        // Suppose you're calculating totals from the `products`
        let subtotal = 0;
        for (const product of products) {
          const itemTotal = product.price * product.quantity;
          subtotal += itemTotal;
    
          // Wrap item name if it's long
          const textWrapHeight = drawWrappedText(
            product.name,
            tableHeaderX[0],
            yPos,
            180 // maximum width for item description
          );
    
          // Price
          page.drawText(`$${product.price.toFixed(2)}`, {
            x: tableHeaderX[1],
            y: yPos,
          });
    
          // Quantity
          page.drawText(`${product.quantity}`, {
            x: tableHeaderX[2],
            y: yPos,
          });
    
          // Total
          page.drawText(`$${itemTotal.toFixed(2)}`, {
            x: tableHeaderX[3],
            y: yPos,
          });
    
          // Update yPos based on how much vertical space the item text used
          yPos -= (lineHeight + textWrapHeight);
        }
    
        // Draw line under table
        yPos -= 5;
        page.drawLine({
          start: { x: 50, y: yPos },
          end: { x: 545, y: yPos },
          thickness: 1,
          color: textColor,
        });
        yPos -= (lineHeight + 5);
    
        // --- 5) Totals Section (if you have taxes or other fees) ---
        const tax = 0; // or compute if needed
        const grandTotal = subtotal + tax;
    
        page.drawText(`Subtotal:  $${subtotal.toFixed(2)}`, {
          x: 350,
          y: yPos,
        });
        yPos -= lineHeight;
    
        page.drawText(`Tax:       $${tax.toFixed(2)}`, {
          x: 350,
          y: yPos,
        });
        yPos -= lineHeight;
    
        page.setFontSize(14);
        page.drawText(`Total:     $${grandTotal.toFixed(2)}`, {
          x: 350,
          y: yPos,
          color: rgb(0, 0, 0.8), // or keep black
        });
        page.setFontSize(12);
    
        yPos -= (lineHeight * 2);
    
        // --- 6) Additional Notes (Bank Details, Payment Terms, etc.) ---
        page.drawText("Payment / Bank Details:", { x: marginLeft, y: yPos });
        yPos -= lineHeight;
        page.drawText("Bank: ICICI Bank", { x: marginLeft, y: yPos });
        yPos -= lineHeight;
        page.drawText("Account Name: Spot Furnish Rentals", { x: marginLeft, y: yPos });
        yPos -= lineHeight;
        page.drawText("A/C: 919010043469563 | IFSC: UTIB0003569", {
          x: marginLeft,
          y: yPos,
        });
        yPos -= lineHeight;
    
        // Example disclaimers
        yPos -= (lineHeight);
        page.drawText("Rent will be due at the beginning of the month.", {
          x: marginLeft,
          y: yPos,
        });
        yPos -= lineHeight;
        page.drawText("Please pay before the 5th of every month to avoid a late fee.", {
          x: marginLeft,
          y: yPos,
        });
    
        // --- 7) Finish the PDF and attach to email ---
        const pdfBytes = await pdfDoc.save();


        // **Setup Email Transport**
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,  // Your email
                pass: process.env.SMTP_PASS   // App Password (not normal password)
            }
        });

        // **Email Content**
        const emailContent = `
            <h2>Thank you for your purchase!</h2>
            <p>Please find your invoice attached.</p>
            <p>Order details:</p>
            <ul>
                ${products.map(product => `<li><strong>${product?.name}</strong> - $${product.price.toFixed(2)}</li>`).join("")}
            </ul>
            <p><strong>Total:</strong> $${grandTotal.toFixed(2)}</p>
            <p>If you have any questions, please contact support.</p>
        `;

        // **Send Invoice to Customer**
        await transporter.sendMail({
            from: `"Your Company" <${process.env.SMTP_USER}>`,
            to: customer.email,
            subject: `Invoice #${invoiceNumber} for Your Purchase`,
            html: emailContent,
            attachments: [
                {
                    filename: `Invoice-${invoiceNumber}.pdf`,
                    content: pdfBytes,
                    encoding: "base64"
                }
            ]
        });

        // **Send Invoice to Admin**
        await transporter.sendMail({
            from: `"Your Company" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `New Purchase - Invoice #${invoiceNumber}`,
            html: `<h2>New Purchase Alert</h2><p>A new purchase has been made.</p>`,
            attachments: [
                {
                    filename: `Invoice-${invoiceNumber}.pdf`,
                    content: pdfBytes,
                    encoding: "base64"
                }
            ]
        });

        const newOrder = new Orders({
            userId,
            productIds: products.map(product => product.productId),
            totalAmount:grandTotal,
            orderDate: new Date(),
            invoiceNumber,
            status: 'Pending',
        });

        // Save the order to the database
        const savedOrder = await newOrder.save();

        res.status(201).json({ success: true, message: 'Order placed successfully',invoiceNumber: invoiceNumber });

    } catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).json({ success: false, message: "Failed to process purchase" });
    }
});


// GET: Get Orders by User ID
router.get("/orders/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Find orders for the given user
        const orders = await Orders.find({ userId }).populate("productIds");

        res.json({ success: true, orders });
    } catch (error) {
        console.error("Error retrieving orders:", error);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
});



// Route to get user's phone number
router.get('/api/get-user-phone', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ phoneNumber: user.phoneNumber || '' }); // Send empty if phone number doesn't exist
    } catch (error) {
        console.error('Error fetching phone number:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

    


  

module.exports = router;