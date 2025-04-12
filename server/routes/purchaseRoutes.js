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
      const { userId, totalAmount, products, customer, adminEmail } = req.body;
  
      const invoiceNumber = `INV-${Date.now().toString().substr(-6)}`;
      const today = new Date();
      const date = formatDate(today);
      
      // Calculate delivery date (default to 3 days from now)
      const deliveryDate = new Date(today);
      deliveryDate.setDate(deliveryDate.getDate() + 3);
      const formattedDeliveryDate = `${deliveryDate.getDate()}${getOrdinalSuffix(deliveryDate.getDate())} ${deliveryDate.toLocaleString('en-GB', { month: 'short' })} ${deliveryDate.getFullYear()}`;
      
      // Calculate totals from products
      let monthlyTotal = 0;
      products.forEach(product => {
        monthlyTotal += product.price * product.quantity;
      });
      
      // Calculate deposit (2 months' rent)
      const deposit = monthlyTotal * 2;
      
      // Transportation fee
      const transportationFee = 4500;
  
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
      // Colors & positions
      const textColor = rgb(0, 0, 0);
      const greenColor = rgb(0, 0.6, 0.3);
      const marginLeft = 50;
      let yPos = 780;
      const lineHeight = 15;
  
      // Header: "Spot Furnish Rentals" with green color
      page.setFont(helveticaBold);
      page.setFontSize(24);
      page.drawText("Spot Furnish Rentals", {
        x: marginLeft,
        y: yPos,
        color: greenColor,
      });
  
      // Address and contact information
      page.setFont(helveticaFont);
      page.setFontSize(12);
      yPos -= 30;
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
      page.drawText("+91 8123096928", {
        x: marginLeft,
        y: yPos,
        color: textColor,
      });
  
      yPos -= lineHeight;
      page.drawText("+91 9844311875", {
        x: marginLeft,
        y: yPos,
        color: textColor,
      });
  
      // Quotation title
      yPos -= 30;
      page.setFont(helveticaBold);
      page.setFontSize(16);
      page.drawText("Quotation", {
        x: marginLeft,
        y: yPos,
        color: textColor,
      });
  
      // Delivery To and Date sections
      yPos -= 25;
      const leftColumnX = marginLeft;
      const rightColumnX = 350; // Moved left to ensure space for date
  
      page.setFont(helveticaBold);
      page.setFontSize(12);
      page.drawText("Delivery To :", {
        x: leftColumnX,
        y: yPos,
        color: textColor,
      });
  
      page.drawText("Date", {
        x: rightColumnX,
        y: yPos,
        color: textColor,
      });
  
      // Customer details
      yPos -= lineHeight;
      page.setFont(helveticaFont);
      page.drawText(`${customer.company || "Toyota Financial Services India Ltd,"}`, {
        x: leftColumnX,
        y: yPos,
        color: textColor,
      });
  
      // Date value with ordinal
      page.drawText(`${date}`, {
        x: rightColumnX,
        y: yPos,
        color: textColor,
      });
  
      // Customer location
      yPos -= lineHeight;
      page.drawText(`${customer.location || customer.city || "Bengaluru"} ${customer.zipCode ? `-${customer.zipCode}` : "-560001"}`, {
        x: leftColumnX,
        y: yPos,
        color: textColor,
      });
  
      // Draw underlines
      yPos -= 10;
      page.drawLine({
        start: { x: leftColumnX, y: yPos },
        end: { x: leftColumnX + 250, y: yPos },
        thickness: 1,
        color: textColor,
      });
  
      page.drawLine({
        start: { x: rightColumnX, y: yPos },
        end: { x: rightColumnX + 150, y: yPos },
        thickness: 1,
        color: textColor,
      });
  
      // Table dimensions - ADJUSTED FOR BETTER FIT
      yPos -= 25;
      const tableStartX = 50;  // Moved left for more space
      const tableWidth = 495;  // Total width of table
      
      // Column widths adjusted to fit content properly
      const col1Width = 240;  // Items column - reduced
      const col2Width = 85;   // Amount column
      const col3Width = 40;   // Qty column - reduced
      const col4Width = 130;  // Total Amount column - increased
      
      const col1X = tableStartX;
      const col2X = col1X + col1Width;
      const col3X = col2X + col2Width;
      const col4X = col3X + col3Width;
      const tableEndX = col4X + col4Width;
      
      // Table headers
      page.setFont(helveticaBold);
      page.setFontSize(12);
      
      // Center-aligned header text
      page.drawText("Items", { 
        x: col1X + (col1Width / 2) - 20, 
        y: yPos, 
        color: textColor 
      });
      
      page.drawText("Amount", { 
        x: col2X + (col2Width / 2) - 25, 
        y: yPos, 
        color: textColor 
      });
      
      page.drawText("Qty", { 
        x: col3X + (col3Width / 2) - 10, 
        y: yPos, 
        color: textColor 
      });
      
      page.drawText("Total Amount", { 
        x: col4X + (col4Width / 2) - 45, 
        y: yPos, 
        color: textColor 
      });
      
      // Draw outer table border and header row
      yPos -= 5;
      
      // Draw top horizontal line of table
      page.drawLine({
        start: { x: tableStartX, y: yPos },
        end: { x: tableEndX, y: yPos },
        thickness: 1,
        color: textColor,
      });
      
      // Calculate approx table height based on number of rows
      const rowCount = products.length + 7; // products + headers + totals + additional rows
      const tableHeight = rowCount * 20; // Approximate height per row
      
      // Draw vertical lines for columns
      const columnPositions = [tableStartX, col2X, col3X, col4X, tableEndX];
      
      for (const xPos of columnPositions) {
        page.drawLine({
          start: { x: xPos, y: yPos },
          end: { x: xPos, y: yPos - tableHeight },
          thickness: 1,
          color: textColor,
        });
      }
      
      // Draw product rows
      let currentY = yPos - 20; // Starting position for first product
      page.setFont(helveticaFont);
      
      for (const product of products) {
        const itemTotal = product.price * product.quantity;
        
        // Product name - left aligned
        page.drawText(product.name, { 
          x: col1X + 5, 
          y: currentY, 
          color: textColor 
        });
        
        // Price - right aligned
        const priceText = product.price.toString();
        const priceWidth = helveticaFont.widthOfTextAtSize(priceText, 12);
        page.drawText(priceText, { 
          x: col3X - priceWidth - 10, 
          y: currentY, 
          color: textColor 
        });
        
        // Quantity - center aligned
        const qtyText = product.quantity.toString();
        const qtyWidth = helveticaFont.widthOfTextAtSize(qtyText, 12);
        page.drawText(qtyText, { 
          x: col3X + (col4X - col3X - qtyWidth) / 2, 
          y: currentY, 
          color: textColor 
        });
        
        // Total - right aligned
        const totalText = itemTotal.toString();
        const totalWidth = helveticaFont.widthOfTextAtSize(totalText, 12);
        page.drawText(totalText, { 
          x: tableEndX - totalWidth - 15, 
          y: currentY, 
          color: textColor 
        });
        
        // Draw row border
        currentY -= 5;
        page.drawLine({
          start: { x: tableStartX, y: currentY },
          end: { x: tableEndX, y: currentY },
          thickness: 1,
          color: textColor,
        });
        
        currentY -= 15; // Move to next row
      }
      
      // Total Monthly Package row
      page.setFont(helveticaBold);
      page.drawText("Total Monthly Package", { 
        x: col1X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      // Right-align the total
      const totalText = monthlyTotal.toString();
      const totalWidth = helveticaBold.widthOfTextAtSize(totalText, 12);
      page.drawText(totalText, { 
        x: tableEndX - totalWidth - 15, 
        y: currentY, 
        color: textColor 
      });
      
      // Draw row border
      currentY -= 5;
      page.drawLine({
        start: { x: tableStartX, y: currentY },
        end: { x: tableEndX, y: currentY },
        thickness: 1,
        color: textColor,
      });
      currentY -= 15;
      
      // Fully Refundable Deposit
      page.setFont(helveticaFont);
      page.drawText("Fully Refundable Deposit", { 
        x: col1X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      page.drawText("2 Months' Rent", { 
        x: col2X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      // Draw row border
      currentY -= 5;
      page.drawLine({
        start: { x: tableStartX, y: currentY },
        end: { x: tableEndX, y: currentY },
        thickness: 1,
        color: textColor,
      });
      currentY -= 15;
      
      // Minimum Lock in Period
      const lockInPeriod = req.body.lockInPeriod || "6 Months";
      page.drawText("Minimum Lock in Period", { 
        x: col1X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      page.drawText(lockInPeriod, { 
        x: col2X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      // Draw row border
      currentY -= 5;
      page.drawLine({
        start: { x: tableStartX, y: currentY },
        end: { x: tableEndX, y: currentY },
        thickness: 1,
        color: textColor,
      });
      currentY -= 15;
      
      // Delivery Date
      const orderDeliveryDate = req.body.deliveryDate 
        ? formatDate(new Date(req.body.deliveryDate)) 
        : formattedDeliveryDate;
        
      page.drawText("Delivery Date", { 
        x: col1X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      page.drawText(orderDeliveryDate, { 
        x: col2X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      // Draw row border
      currentY -= 5;
      page.drawLine({
        start: { x: tableStartX, y: currentY },
        end: { x: tableEndX, y: currentY },
        thickness: 1,
        color: textColor,
      });
      currentY -= 15;
      
      // One time Transportation
      const transportation = req.body.transportationFee || transportationFee;
      page.drawText("One time Transportation", { 
        x: col1X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      // Right-align transportation fee
      const transportText = transportation.toString();
      const transportWidth = helveticaFont.widthOfTextAtSize(transportText, 12);
      page.drawText(transportText, { 
        x: col3X - transportWidth - 10, 
        y: currentY, 
        color: textColor 
      });
      
      // Draw row border
      currentY -= 5;
      page.drawLine({
        start: { x: tableStartX, y: currentY },
        end: { x: tableEndX, y: currentY },
        thickness: 1,
        color: textColor,
      });
      currentY -= 15;
      
      // Rent payment terms
      const lineMaxWidth = col3X - col1X - 10;
      page.drawText("Rent will be due beginning of the month, need to pay before 5th of", { 
        x: col1X + 5, 
        y: currentY, 
        color: textColor,
        maxWidth: lineMaxWidth
      });
      
      currentY -= lineHeight;
      page.drawText("every month.", { 
        x: col1X + 5, 
        y: currentY, 
        color: textColor 
      });
      
      // Payment term type
      const paymentTerm = req.body.paymentTerm || "Prepaid Rent";
      page.drawText(paymentTerm, { 
        x: tableEndX - 100, 
        y: currentY + 5, 
        color: textColor 
      });
      
      // Draw final row border
      currentY -= 10;
      page.drawLine({
        start: { x: tableStartX, y: currentY },
        end: { x: tableEndX, y: currentY },
        thickness: 1,
        color: textColor,
      });
      
      // Bottom border of table
      page.drawLine({
        start: { x: tableStartX, y: currentY },
        end: { x: tableEndX, y: currentY },
        thickness: 1,
        color: textColor,
      });
      
      // Payment instructions
      const advanceAmount = req.body.advanceAmount || 20000;
      
      currentY -= 40;
      page.setFont(helveticaFont);
      page.setFontSize(11);
      page.drawText(`To confirm the order, you need to pay rupees ${advanceAmount}/- as a token advance in below account and`, {
        x: tableStartX,
        y: currentY,
        color: textColor,
      });
      
      currentY -= lineHeight;
      page.drawText("the remaining amount to be paid at the time of delivery.", {
        x: tableStartX,
        y: currentY,
        color: textColor,
      });
      
      // Bank details
      const bankName = process.env.BANK_NAME || "AXIS Bank";
      const accountName = process.env.ACCOUNT_NAME || "Preethi Yogesh Navandar";
      const accountNumber = process.env.ACCOUNT_NUMBER || "919010043469563";
      const ifscCode = process.env.IFSC_CODE || "UTIB0003569";
      const upiId = process.env.UPI_ID || "9844723432";
      
      currentY -= 25;
      page.drawText(`${bankName} : ${accountName} :  A/C ${accountNumber} : IFSC- ${ifscCode}`, {
        x: tableStartX,
        y: currentY,
        color: textColor,
      });
      
      currentY -= lineHeight;
      page.drawText(`Gpay/ Phone Pay/Paytm/Cred: ${upiId}`, {
        x: tableStartX,
        y: currentY,
        color: textColor,
      });
  
      // Save and send the PDF
      const pdfBytes = await pdfDoc.save();
  
      // Setup Email Transport
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
  
      // Create dynamic email content
      const productList = products.map(product => 
        `<li><strong>${product.name}</strong> - ₹${product.price} x ${product.quantity} = ₹${product.price * product.quantity}</li>`
      ).join("");
  
      // Email Content
      const emailContent = `
        <h2>Thank you for your purchase!</h2>
        <p>Please find your quotation attached.</p>
        <p>Order details:</p>
        <ul>
          ${productList}
        </ul>
        <p><strong>Total Monthly Package:</strong> ₹${monthlyTotal}</p>
        <p>To confirm your order, please pay ₹${advanceAmount} as token advance to the bank account mentioned in the quotation.</p>
        <p>If you have any questions, please contact us at +91 8123096928 or +91 9844311875.</p>
      `;
  
      // Send Invoice to Customer
      await transporter.sendMail({
        from: `"Spot Furnish Rentals" <${process.env.SMTP_USER}>`,
        to: customer.email,
        subject: `Quotation #${invoiceNumber} from Spot Furnish Rentals`,
        html: emailContent,
        attachments: [
          {
            filename: `Quotation-${invoiceNumber}.pdf`,
            content: pdfBytes,
            encoding: "base64"
          }
        ]
      });
  
      // Send Invoice to Admin
      await transporter.sendMail({
        from: `"Spot Furnish Rentals" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `New Quotation Generated - #${invoiceNumber}`,
        html: `<h2>New Quotation Alert</h2><p>A new quotation has been generated for ${customer.company || customer.name}.</p>`,
        attachments: [
          {
            filename: `Quotation-${invoiceNumber}.pdf`,
            content: pdfBytes,
            encoding: "base64"
          }
        ]
      });
  
      // Store in database
      const newOrder = new Orders({
        userId,
        productIds: products.map(product => product.productId || product.id),
        totalAmount: monthlyTotal,
        orderDate: new Date(),
        invoiceNumber,
        status: 'Pending',
      });
  
      const savedOrder = await newOrder.save();
  
      res.status(201).json({ 
        success: true, 
        message: 'Quotation generated and sent successfully',
        invoiceNumber: invoiceNumber,
        orderId: savedOrder._id
      });
  
    } catch (error) {
      console.error("Error processing purchase:", error);
      res.status(500).json({ success: false, message: "Failed to generate quotation", error: error.message });
    }
  });
  
  function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    
    const suffix = getOrdinalSuffix(day);
    return `${day}${suffix} ${month} ${year}`;
  }
  
  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

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