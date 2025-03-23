const express = require('express');
const router = express.Router();
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts,rgb } = require("pdf-lib");

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
router.post('/update-user-phone', async (req, res) => {
    try {
        const { userId, phoneNumber } = req.body;

        if (!userId || !phoneNumber) {
            return res.status(400).json({ success: false, message: "User ID and phone number are required" });
        }

        // Find user by Firebase UID
        const existingUser = await User.findOne({ firebaseUID: userId });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // If the user already has a phone number, check if it matches the entered one
        if (existingUser.phoneNumber) {
            if (existingUser.phoneNumber !== phoneNumber) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Entered phone number does not match the existing one" 
                });
            }
        } else {
            // If no phone number exists, update with the new one
            existingUser.phoneNumber = phoneNumber;
            await existingUser.save();
        }

        res.json({ success: true, user: existingUser, message: "Phone number updated successfully" });
    } catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ success: false, message: 'Failed to update phone number' });
    }
});


// Process purchase and generate invoice



router.post("/process-purchase", async (req, res) => {
    try {
        const { products, customer, adminEmail } = req.body;
        
        // Generate invoice details
        const invoiceNumber = `INV-${Date.now().toString().substr(-6)}`;
        const date = new Date().toLocaleDateString();

        // **Generate PDF Document**
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]); // A4 Size
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        page.setFont(font);

        let yPos = 770;
        const lineHeight = 20;
        const marginLeft = 50;
        const textColor = rgb(0.2, 0.2, 0.2); // Dark gray color for text

        // **Company Logo Placeholder**
        page.setFontSize(24);
        page.drawText("Company Name", { x: marginLeft, y: yPos, color: textColor });
        page.setFontSize(12);
        page.drawText("123 Business St, City, Country", { x: marginLeft, y: yPos - 20 });
        page.drawText("Email: support@company.com | Phone: +1 234 567 890", { x: marginLeft, y: yPos - 35 });

        yPos -= 80; // Space before invoice title

        // **Invoice Title & Info**
        page.setFontSize(20);
        page.drawText("INVOICE", { x: 240, y: yPos, color: textColor });

        page.setFontSize(12);
        yPos -= 30;
        page.drawText(`Invoice Number: ${invoiceNumber}`, { x: marginLeft, y: yPos });
        page.drawText(`Date: ${date}`, { x: marginLeft, y: yPos - 15 });

        yPos -= 40; // Space before customer info

        // **Customer Information**
        page.setFontSize(12);
        page.drawText("Bill To:", { x: marginLeft, y: yPos, color: textColor });
        yPos -= lineHeight;
        page.drawText(`${customer.email}`, { x: marginLeft, y: yPos - 15 });
        page.drawText(`${customer.phoneNumber}`, { x: marginLeft, y: yPos - 30 });

        yPos -= 50; // Space before table

        // **Table Header**
        const tableHeaders = ["Item", "Price", "Quantity", "Total"];
        let xPositions = [50, 250, 350, 450];

        page.setFontSize(12);
        page.drawText("Item", { x: xPositions[0], y: yPos, color: textColor });
        page.drawText("Price", { x: xPositions[1], y: yPos, color: textColor });
        page.drawText("Quantity", { x: xPositions[2], y: yPos, color: textColor });
        page.drawText("Total", { x: xPositions[3], y: yPos, color: textColor });

        yPos -= lineHeight;

        // **Draw Table Separator**
        page.drawLine({
            start: { x: 50, y: yPos + 5 },
            end: { x: 545, y: yPos + 5 },
            thickness: 1,
            color: textColor,
        });

        yPos -= 10;

        // **Function to Wrap Text**
        function drawWrappedText(page, text, x, y, maxWidth, lineHeight) {
            const words = text.split(" ");
            let line = "";
            let yOffset = 0;

            for (let word of words) {
                let testLine = line.length > 0 ? line + " " + word : word;
                let textWidth = font.widthOfTextAtSize(testLine, 12); // Adjust font size if needed

                if (textWidth > maxWidth) {
                    page.drawText(line, { x, y: y - yOffset, color: textColor });
                    line = word;
                    yOffset += lineHeight;
                } else {
                    line = testLine;
                }
            }

            if (line) {
                page.drawText(line, { x, y: y - yOffset, color: textColor });
            }

            return yOffset;
        }

        // **Product Table Rows**
        let subtotal = 0;
        products.forEach((product) => {
            let total = product.price * product.quantity;
            subtotal += total;

            // **Wrap product name & calculate space used**
            const wrappedHeight = drawWrappedText(page, product.name, xPositions[0], yPos, 180, lineHeight); // 180px max width

            // **Align other columns**
            page.drawText(`$${product.price.toFixed(2)}`, { x: xPositions[1], y: yPos, color: textColor });
            page.drawText(`${product.quantity}`, { x: xPositions[2], y: yPos, color: textColor });
            page.drawText(`$${total.toFixed(2)}`, { x: xPositions[3], y: yPos, color: textColor });

            // **Reduce yPos by total wrapped height**
            yPos -= lineHeight + wrappedHeight;
        });

        // **Table Footer Separator**
        page.drawLine({
            start: { x: 50, y: yPos + 5 },
            end: { x: 545, y: yPos + 5 },
            thickness: 1,
            color: textColor,
        });

        yPos -= 20; // Space before totals

        // **Invoice Totals**
        const tax = 0; // 10% Tax
        const total = subtotal + tax;

        page.setFontSize(12);
        page.drawText("Subtotal:", { x: 350, y: yPos, color: textColor });
        page.drawText(`$${subtotal.toFixed(2)}`, { x: 450, y: yPos, color: textColor });
        page.drawText("Tax (10%):", { x: 350, y: yPos - 15, color: textColor });
        page.drawText(`$${tax.toFixed(2)}`, { x: 450, y: yPos - 15, color: textColor });
        page.drawText("Total:", { x: 350, y: yPos - 30, color: textColor });

        page.setFontSize(14);
        page.drawText(`$${total.toFixed(2)}`, { x: 450, y: yPos - 30, color: rgb(0, 0, 0.8) }); // Dark blue for emphasis

        yPos -= 60; // Space before footer

        // **Footer Section**
        page.setFontSize(10);
        page.drawText("Thank you for your business!", { x: 200, y: yPos, color: textColor });
        page.drawText("Payment is due within 30 days.", { x: 200, y: yPos - 15, color: textColor });

        // **Save PDF in Memory**
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
                ${products.map(product => `<li><strong>${product.productid?.name}</strong> - $${product.price.toFixed(2)}</li>`).join("")}
            </ul>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
            <p>If you have any questions, please contact support.</p>
        `;

        // **Send Invoice to Customer**
        await transporter.sendMail({
            from: `"Your Company" <${process.env.SMTP_USER}>`,
            to: "iampragathish@gmail.com",
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

        res.json({ success: true, invoiceNumber });
    } catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).json({ success: false, message: "Failed to process purchase" });
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