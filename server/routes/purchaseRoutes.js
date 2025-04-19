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
    const greenColor = rgb(0, 0.5, 0.2); // Green color for the title
    const marginLeft = 74;
    let yPos = 780;
    const lineHeight = 15;

    // Company Logo at top right
    try {
      const logoUrl = process.env.COMPANY_LOGO_URL || "https://yourcompany.com/logo.png";
      const logoResponse = await fetch(logoUrl);
      const logoBytes = await logoResponse.arrayBuffer();
      const logoImage = await pdfDoc.embedPng(logoBytes);
      
      // Calculate dimensions maintaining aspect ratio
      const maxWidth = 100;
      const maxHeight = 100;
      const scaleFactor = Math.min(
        maxWidth / logoImage.width,
        maxHeight / logoImage.height
      );
      
      const logoWidth = logoImage.width * scaleFactor;
      const logoHeight = logoImage.height * scaleFactor;
      
      // Position logo at top right
      page.drawImage(logoImage, {
        x: 495 - logoWidth,
        y: yPos - logoHeight + 20,
        width: logoWidth,
        height: logoHeight,
      });
    } catch (err) {
      console.error("Error embedding logo:", err);
      // Continue without logo
    }

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

    // Delivery To and Date sections in two columns
    yPos -= 25;
    const leftColumnX = marginLeft;
    const rightColumnX = 350;

    // Delivery To label and underline (Left column)
    page.setFont(helveticaBold);
    page.setFontSize(12);
    page.drawText("Delivery To :", {
      x: leftColumnX,
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

    // Customer location
    yPos -= lineHeight;
    page.drawText(`${customer.location || customer.city || "Bengaluru"}-${customer.zipCode || "560001"}`, {
      x: leftColumnX,
      y: yPos,
      color: textColor,
    });

    // Date label and info (Right column)
    const dateY = yPos + lineHeight; // Align with first line of customer details
    page.setFont(helveticaBold);
    page.drawText("Date", {
      x: rightColumnX,
      y: dateY,
      color: textColor,
    });

    // Format date as shown in the reference (e.g., "27th Feb 2025")
    const formattedDisplayDate = `${today.getDate()}${getOrdinalSuffix(today.getDate())} ${today.toLocaleString('en-GB', { month: 'short' })} ${today.getFullYear()}`;
    
    page.setFont(helveticaFont);
    page.drawText(formattedDisplayDate, {
      x: rightColumnX,
      y: dateY - lineHeight,
      color: textColor,
    });

    // Draw underlines for both sections
    const underlineY = yPos - 10;
    page.drawLine({
      start: { x: leftColumnX, y: underlineY },
      end: { x: leftColumnX + 250, y: underlineY },
      thickness: 1,
      color: textColor,
    });

    page.drawLine({
      start: { x: rightColumnX, y: underlineY },
      end: { x: rightColumnX + 150, y: underlineY },
      thickness: 1,
      color: textColor,
    });

    // Table dimensions - MATCHING REFERENCE DESIGN
    yPos -= 40;
    const tableStartX = 75;
    const tableWidth = 450;
    
    // Define column widths based on reference
    const colItemsWidth = 230;
    const colAmountWidth = 75;
    const colQtyWidth = 50;
    const colTotalWidth = 95;
    
    // Define column positions
    const colItemsX = tableStartX;
    const colAmountX = colItemsX + colItemsWidth;
    const colQtyX = colAmountX + colAmountWidth;
    const colTotalX = colQtyX + colQtyWidth;
    const tableEndX = colTotalX + colTotalWidth;
    
    // Draw table header
    // Draw outer border of the table header
    page.drawRectangle({
      x: tableStartX,
      y: yPos - 20,
      width: tableWidth,
      height: 20,
      borderColor: textColor,
      borderWidth: 1,
    });
    
    // Draw vertical lines for table header
    page.drawLine({
      start: { x: colAmountX, y: yPos },
      end: { x: colAmountX, y: yPos - 20 },
      thickness: 1,
      color: textColor,
    });
    
    page.drawLine({
      start: { x: colQtyX, y: yPos },
      end: { x: colQtyX, y: yPos - 20 },
      thickness: 1,
      color: textColor,
    });
    
    page.drawLine({
      start: { x: colTotalX, y: yPos },
      end: { x: colTotalX, y: yPos - 20 },
      thickness: 1,
      color: textColor,
    });
    
    // Table header text - centered in each column
    page.setFont(helveticaBold);
    page.setFontSize(12);
    
    // Draw header texts centered in their columns
    page.drawText("Items", {
      x: colItemsX + (colItemsWidth / 2) - 20,
      y: yPos - 15,
      color: textColor,
    });
    
    page.drawText("Amount", {
      x: colAmountX + (colAmountWidth / 2) - 25,
      y: yPos - 15,
      color: textColor,
    });
    
    page.drawText("Qty", {
      x: colQtyX + (colQtyWidth / 2) - 10,
      y: yPos - 15,
      color: textColor,
    });
    
    page.drawText("Total Amount", {
      x: colTotalX + (colTotalWidth / 2) - 40,
      y: yPos - 15,
      color: textColor,
    });
    
    // Start drawing product rows
    let currentY = yPos - 20;
    page.setFont(helveticaFont);
    
    // Draw each product row
    for (const product of products) {
      const itemTotal = product.price * product.quantity;
      
      // Draw row border
      page.drawRectangle({
        x: tableStartX,
        y: currentY - 20,
        width: tableWidth,
        height: 20,
        borderColor: textColor,
        borderWidth: 1,
      });
      
      // Draw vertical lines
      page.drawLine({
        start: { x: colAmountX, y: currentY },
        end: { x: colAmountX, y: currentY - 20 },
        thickness: 1,
        color: textColor,
      });
      
      page.drawLine({
        start: { x: colQtyX, y: currentY },
        end: { x: colQtyX, y: currentY - 20 },
        thickness: 1,
        color: textColor,
      });
      
      page.drawLine({
        start: { x: colTotalX, y: currentY },
        end: { x: colTotalX, y: currentY - 20 },
        thickness: 1,
        color: textColor,
      });
      
      // Product details
      page.setFont(helveticaFont);
      
      // Product name - left aligned with padding
      page.drawText(product.name, {
        x: colItemsX + 5,
        y: currentY - 15,
        color: textColor,
        maxWidth: colItemsWidth - 10,
      });
      
      // Price - center aligned in amount column
      const priceText = product.price.toString();
      const priceWidth = helveticaFont.widthOfTextAtSize(priceText, 12);
      page.drawText(priceText, {
        x: colAmountX + (colAmountWidth / 2) - (priceWidth / 2),
        y: currentY - 15,
        color: textColor,
      });
      
      // Quantity - center aligned
      const qtyText = product.quantity.toString();
      const qtyWidth = helveticaFont.widthOfTextAtSize(qtyText, 12);
      page.drawText(qtyText, {
        x: colQtyX + (colQtyWidth / 2) - (qtyWidth / 2),
        y: currentY - 15,
        color: textColor,
      });
      
      // Total - center aligned
      const totalText = itemTotal.toString();
      const totalWidth = helveticaFont.widthOfTextAtSize(totalText, 12);
      page.drawText(totalText, {
        x: colTotalX + (colTotalWidth / 2) - (totalWidth / 2),
        y: currentY - 15,
        color: textColor,
      });
      
      currentY -= 20; // Move to next row
    }
    
    // Total Monthly Package row
    // Draw row border
    page.drawRectangle({
      x: tableStartX,
      y: currentY - 20,
      width: tableWidth,
      height: 20,
      borderColor: textColor,
      borderWidth: 1,
    });
    
    // Draw vertical lines
    page.drawLine({
      start: { x: colAmountX, y: currentY },
      end: { x: colAmountX, y: currentY - 20 },
      thickness: 1,
      color: textColor,
    });
    
    page.drawLine({
      start: { x: colQtyX, y: currentY },
      end: { x: colQtyX, y: currentY - 20 },
      thickness: 1,
      color: textColor,
    });
    
    page.drawLine({
      start: { x: colTotalX, y: currentY },
      end: { x: colTotalX, y: currentY - 20 },
      thickness: 1,
      color: textColor,
    });
    
    // Total Monthly Package text
    page.setFont(helveticaBold);
    page.drawText("Total Monthly Package", {
      x: colItemsX + 5,
      y: currentY - 15,
      color: textColor,
    });
    
    // Total Monthly Package amount
    const monthlyTotalText = monthlyTotal.toString();
    const monthlyTotalWidth = helveticaBold.widthOfTextAtSize(monthlyTotalText, 12);
    page.drawText(monthlyTotalText, {
      x: colTotalX + (colTotalWidth / 2) - (monthlyTotalWidth / 2),
      y: currentY - 15,
      color: textColor,
    });
    
    currentY -= 20;
    
    // Fully Refundable Deposit row
    // Draw row border
    page.drawRectangle({
      x: tableStartX,
      y: currentY - 20,
      width: tableWidth,
      height: 20,
      borderColor: textColor,
      borderWidth: 1,
    });
    
    // Draw vertical line at total column
    page.drawLine({
      start: { x: colAmountX, y: currentY },
      end: { x: colAmountX, y: currentY - 20 },
      thickness: 1,
      color: textColor,
    });
    
    // Fully Refundable Deposit text
    page.setFont(helveticaFont);
    page.drawText("Fully Refundable Deposit", {
      x: colItemsX + 5,
      y: currentY - 15,
      color: textColor,
    });
    
    // Deposit amount (2 Months' Rent)
    const depositText = `2 Months' Rent (${deposit})`;
    page.drawText(depositText, {
      x: colAmountX + 5,
      y: currentY - 15,
      color: textColor,
    });
    
    currentY -= 20;
    
    // Minimum Lock in Period row
    // Draw row border
    page.drawRectangle({
      x: tableStartX,
      y: currentY - 20,
      width: tableWidth,
      height: 20,
      borderColor: textColor,
      borderWidth: 1,
    });
    
    // Draw vertical line at amount column
    page.drawLine({
      start: { x: colAmountX, y: currentY },
      end: { x: colAmountX, y: currentY - 20 },
      thickness: 1,
      color: textColor,
    });
    
    // Minimum Lock in Period text
    page.drawText("Minimum Lock in Period", {
      x: colItemsX + 5,
      y: currentY - 15,
      color: textColor,
    });
    
    // Lock in period value
    const lockInPeriod = req.body.lockInPeriod || "6 Months";
    page.drawText(lockInPeriod, {
      x: colAmountX + 5,
      y: currentY - 15,
      color: textColor,
    });
    
    currentY -= 20;
    
    // Delivery Date row
    // Draw row border
    page.drawRectangle({
      x: tableStartX,
      y: currentY - 20,
      width: tableWidth,
      height: 20,
      borderColor: textColor,
      borderWidth: 1,
    });
    
    // Draw vertical line at amount column
    page.drawLine({
      start: { x: colAmountX, y: currentY },
      end: { x: colAmountX, y: currentY - 20 },
      thickness: 1,
      color: textColor,
    });
    
    // Delivery Date text
    page.drawText("Delivery Date", {
      x: colItemsX + 5,
      y: currentY - 15,
      color: textColor,
    });
    
    // Delivery date value
    const orderDeliveryDate = req.body.deliveryDate 
      ? formatDate(new Date(req.body.deliveryDate)) 
      : `${deliveryDate.getDate()}${getOrdinalSuffix(deliveryDate.getDate())} ${deliveryDate.toLocaleString('en-GB', { month: 'short' })} ${deliveryDate.getFullYear()}`;
      
    page.drawText(orderDeliveryDate, {
      x: colAmountX + 5,
      y: currentY - 15,
      color: textColor,
    });
    
    currentY -= 20;
    
    // One time Transportation row
    // Draw row border
    page.drawRectangle({
      x: tableStartX,
      y: currentY - 20,
      width: tableWidth,
      height: 20,
      borderColor: textColor,
      borderWidth: 1,
    });
    
    // Draw vertical line at amount column
    page.drawLine({
      start: { x: colTotalX, y: currentY },
      end: { x: colTotalX, y: currentY - 20 },
      thickness: 1,
      color: textColor,
    });
    
    // One time Transportation text
    page.drawText("One time Transportation", {
      x: colItemsX + 5,
      y: currentY - 15,
      color: textColor,
    });
    
    // Transportation fee value
    const transportation = req.body.transportationFee || transportationFee;
    const transportationText = transportation.toString();
    page.drawText(transportationText, {
      x: colTotalX + (colTotalWidth / 2) - (helveticaFont.widthOfTextAtSize(transportationText, 12) / 2),
      y: currentY - 15,
      color: textColor,
    });
    
    currentY -= 20;
    
    // Rent payment terms row
    // Draw row border
    page.drawRectangle({
      x: tableStartX,
      y: currentY - 20,
      width: tableWidth,
      height: 20,
      borderColor: textColor,
      borderWidth: 1,
    });
    
    // Draw vertical line at total column
    page.drawLine({
      start: { x: colTotalX, y: currentY },
      end: { x: colTotalX, y: currentY - 20 },
      thickness: 1,
      color: textColor,
    });
    
    // Rent payment terms text
    page.drawText("Rent will be due beginning of the month, need to pay before 5th of", {
      x: colItemsX + 5,
      y: currentY - 10,
      color: textColor,
    });
    
    page.drawText("every month.", {
      x: colItemsX + 5,
      y: currentY - 20,
      color: textColor,
    });
    
    // Payment term
    const paymentTerm = req.body.paymentTerm || "Prepaid Rent";
    page.drawText(paymentTerm, {
      x: colTotalX + (colTotalWidth / 2) - (helveticaFont.widthOfTextAtSize(paymentTerm, 12) / 2),
      y: currentY - 15,
      color: textColor,
    });
    
    currentY -= 30;
    
    // Payment instructions
    const advanceAmount = req.body.advanceAmount || 20000;
    
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
    page.setFont(helveticaBold);
    page.drawText(`${bankName}`, {
      x: tableStartX,
      y: currentY,
      color: textColor,
    });
    
    page.setFont(helveticaFont);
    page.drawText(`: ${accountName} : A/C ${accountNumber} : IFSC- ${ifscCode}`, {
      x: tableStartX + helveticaBold.widthOfTextAtSize(bankName, 11) + 5,
      y: currentY,
      color: textColor,
    });
    
    currentY -= lineHeight;
    page.drawText(`Gpay/ Phone Pay/Paytm/Cred: ${upiId}`, {
      x: tableStartX,
      y: currentY,
      color: textColor,
    });
    
    // Document requirements note
    currentY -= 25;
    page.setFont(helveticaBold);
    page.setFontSize(11);
    page.drawText("Documents required before delivery: PAN, AADHAR, Company Incorporation or GST", {
      x: tableStartX,
      y: currentY,
      color: rgb(0.8, 0, 0), // Red color
    });
    
    currentY -= lineHeight;
    page.drawText("Certificate and Rental Agreement of office.", {
      x: tableStartX,
      y: currentY,
      color: rgb(0.8, 0, 0), // Red color
    });
    
    // Add product images at bottom
    currentY -= 40;
    
    // Draw product images in a row
    const imageWidth = Math.min(150, tableWidth / products.length);
    const imageHeight = 120;
    let imageX = tableStartX;
    
    for (const product of products) {
      if (product.images[0]) {
        try {
          
          const imageUrl = product.images[0];
      
      // Fetch the image
          const imageResponse = await fetch(imageUrl);
    
          const imageBytes = await imageResponse.arrayBuffer();
          
          // Determine image type and embed accordingly
          let productImage;
          if (product.imageUrl?.toLowerCase().endsWith('.jpg') || product.imageUrl?.toLowerCase().endsWith('.jpeg')) {
            productImage = await pdfDoc.embedJpg(imageBytes);
          } else if (product.imageUrl.toLowerCase().endsWith('.png')) {
            productImage = await pdfDoc.embedPng(imageBytes);
          } else {
            throw new Error("Unsupported image format");
          }
          
          // Calculate image dimensions maintaining aspect ratio
          const scaleFactor = Math.min(
            imageWidth / productImage.width,
            imageHeight / productImage.height
          );
          
          const scaledWidth = productImage.width * scaleFactor;
          const scaledHeight = productImage.height * scaleFactor;
          
          // Draw the image
          page.drawImage(productImage, {
            x: imageX,
            y: currentY - scaledHeight,
            width: scaledWidth,
            height: scaledHeight,
          });
          
          imageX += imageWidth + 10; // Add some spacing between images
        } catch (err) {
          console.error(`Error embedding image for product ${product.name}:`, err);
          // Continue to next product if image fails
        }
      }
    }

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

// Helper function to format date
function formatDate(date) {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

// Helper function to get ordinal suffix for date
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Helper function to format date
function formatDate(date) {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

// Helper function to get ordinal suffix for date
function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
  
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