const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const path = require('path');
//const { PDFDocument, StandardFonts,rgb } = require("pdf-lib");
const Orders = require('../models/Orders');
const PDFDocument = require('pdfkit');


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


// Helper function to get ordinal suffix
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
  const month = date.toLocaleString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
}


const fetchImageBuffer = async (imageUrl) => {
  try {
    // Use axios or node-fetch to get the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (err) {
    console.error(`Error fetching image from ${imageUrl}:`, err);
    return null;
  }
};


const formatAddress = (address) => {
  if (!address) return '';
  return address.split(',').join(',\n');
};

router.post("/process-purchase", async (req, res) => {
  try {
    const { userId, totalAmount, products, customer, adminEmail } = req.body;

    const invoiceNumber = `INV-${Date.now().toString().substr(-6)}`;
    const today = new Date();
    const date = formatDate(today);
    
    // Calculate delivery date (default to 3 days from now)
    const deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const formattedDeliveryDate = formatDate(deliveryDate);
    
    // Calculate totals from products
    let monthlyTotal = 0;
    products.forEach(product => {
      monthlyTotal += product.price * product.quantity;
    });
    
    // Calculate deposit (2 months' rent)
    const deposit = monthlyTotal * 2;
    
    // Transportation fee
    const transportationFee = 750;

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true // Enable buffering to add page numbers later
    });

    // Pipe the PDF into a file
    const pdfPath = `./quotation-${invoiceNumber}.pdf`;
    const pdfStream = fs.createWriteStream(pdfPath);
    doc.pipe(pdfStream);

    // Define colors
    const greenColor = '#00802E';
    const blackColor = '#000000';
    const redColor = '#CC0000';

    // Set positions
    const marginLeft = 50;
    const marginRight = 550;
    let yPos = 80;
    const lineHeight = 15;
    
    // Add company logo
    try {
      const logoUrl = path.join(__dirname, "../uploads/logo.jpeg"); // Adjust the path as needed
      doc.image(logoUrl, marginRight - 100, yPos - 20, { width: 100 });
    } catch (err) {
      console.error("Error adding logo:", err);
    }

    // Add company name
    doc.font('Helvetica-Bold')
      .fontSize(24)
      .fillColor(greenColor)
      .text('Spot Furnish Rentals', marginLeft, yPos);

    // Add company address and contact information
    yPos += 40;
    doc.font('Helvetica')
      .fontSize(12)
      .fillColor(blackColor)
      .text('8th Main, Ramamurthy Nagar main Road', marginLeft, yPos)
      .text('Bengaluru, Karnataka 560016', marginLeft, yPos + lineHeight)
      .text('+91 8123096928', marginLeft, yPos + lineHeight * 2)
      .text('+91 9844311875', marginLeft, yPos + lineHeight * 3);

    // Add quotation title
    yPos += lineHeight * 5;
    doc.font('Helvetica-Bold')
      .fontSize(16)
      .text('Quotation', marginLeft, yPos);

    // Add delivery to and date sections
    yPos += 25;
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .text('Delivery To :', marginLeft, yPos);

    // Format the customer address with each part on a new line
    // Split address into parts and format properly
    const addressParts = [];
    if (customer.address) {
      // Split by commas and format each part on a new line
      const addressComponents = customer.address.split(',').map(part => part.trim());
      addressParts.push(...addressComponents);
    } else {
      addressParts.push('Address not provided');
    }
    
    // Add city and zip separately if available
    if (customer.location || customer.city) {
      addressParts.push(customer.location || customer.city);
    }
    
    // Add formatted address
    let addressYPos = yPos + lineHeight;
    addressParts.forEach((part, index) => {
      doc.font('Helvetica')
         .text(part, marginLeft, addressYPos);
      addressYPos += lineHeight;
    });

    doc.font('Helvetica-Bold').text('Contact No:', marginLeft, addressYPos)
   .font('Helvetica').text(customer.phoneNumber, marginLeft + 100, addressYPos);





    // Add date information on the right
    doc.font('Helvetica-Bold')
      .text('Date', 400, yPos);
    
    doc.font('Helvetica')
      .text(date, 400, yPos + lineHeight);
      
    // Add delivery date near purchase date
    doc.font('Helvetica-Bold')
      .text('Delivery Date', 400, yPos + lineHeight * 2);
      
    doc.font('Helvetica')
      .text(req.body.deliveryDate ? formatDate(new Date(req.body.deliveryDate)) : formattedDeliveryDate, 400, yPos + lineHeight * 3);

    // Add underlines
    const underlineYPos = Math.max(addressYPos + lineHeight, yPos + lineHeight * 3);
    doc.moveTo(marginLeft, underlineYPos)
      .lineTo(marginLeft + 250, underlineYPos)
      .stroke();

    doc.moveTo(400, yPos + lineHeight * 5)
      .lineTo(550, yPos + lineHeight * 5)
      .stroke();

    // Table setup - adjust starting position based on address height
    yPos = underlineYPos + lineHeight * 3;
    const tableTop = yPos;
    const tableWidth = 500;
    
    // Improved column widths for better spacing
    const colWidth = [200, 80, 70, 50, 100];
    const colStart = [
      marginLeft, 
      marginLeft + colWidth[0], 
      marginLeft + colWidth[0] + colWidth[1],
      marginLeft + colWidth[0] + colWidth[1] + colWidth[2],
      marginLeft + colWidth[0] + colWidth[1] + colWidth[2] + colWidth[3]
    ];
    
    // Draw table header
    doc.rect(marginLeft, yPos, tableWidth, 20).stroke();
    
    // Draw table header vertical lines
    doc.moveTo(colStart[1], yPos).lineTo(colStart[1], yPos + 20).stroke();
    doc.moveTo(colStart[2], yPos).lineTo(colStart[2], yPos + 20).stroke();
    doc.moveTo(colStart[3], yPos).lineTo(colStart[3], yPos + 20).stroke();
    doc.moveTo(colStart[4], yPos).lineTo(colStart[4], yPos + 20).stroke();
    
    // Add table header text with improved positioning
    doc.font('Helvetica-Bold')
      .text('Items', colStart[0] + 5, yPos + 7)
      .text('Duration', colStart[1] + 5, yPos + 7)
      .text('Amount', colStart[2] + 5, yPos + 7)
      .text('Qty', colStart[3] + 5, yPos + 7)
      .text('Total', colStart[4] + 35, yPos + 7);
    
    // Draw product rows
    yPos += 20;
    doc.font('Helvetica');
    
    // Draw each product row
    for (const product of products) {
      const itemTotal = product.price * product.quantity;
      const duration = product.duration || req.body.duration || '3 Months'; // Use product-specific duration if available
      
      // Draw row borders
      doc.rect(marginLeft, yPos, tableWidth, 20).stroke();
      
      // Draw row vertical lines
      doc.moveTo(colStart[1], yPos).lineTo(colStart[1], yPos + 20).stroke();
      doc.moveTo(colStart[2], yPos).lineTo(colStart[2], yPos + 20).stroke();
      doc.moveTo(colStart[3], yPos).lineTo(colStart[3], yPos + 20).stroke();
      doc.moveTo(colStart[4], yPos).lineTo(colStart[4], yPos + 20).stroke();
      
      // Calculate text height for product name to handle possible wrapping
      const nameHeight = doc.heightOfString(product.name, { width: colWidth[0] - 10 });
      const cellHeight = Math.max(20, nameHeight + 10);
      
      // Add product details with proper text alignment
      doc.text(product.name, colStart[0] + 5, yPos + (cellHeight - nameHeight) / 2, { width: colWidth[0] - 10 })
        .text(duration, colStart[1] + 5, yPos + 7)
        .text(product.price.toString(), colStart[2] + 20, yPos + 7)
        .text(product.quantity.toString(), colStart[3] + 15, yPos + 7)
        .text(itemTotal.toString(), colStart[4] + 35, yPos + 7);
      
      yPos += cellHeight;
    }
    
    // Total Monthly Package row
    doc.rect(marginLeft, yPos, tableWidth, 20).stroke();
    doc.moveTo(colStart[4], yPos).lineTo(colStart[4], yPos + 20).stroke();
    
    doc.font('Helvetica-Bold')
      .text('Total Monthly Package', colStart[0] + 5, yPos + 7);
    
    doc.text(monthlyTotal.toString(), colStart[4] + 35, yPos + 7);
    
    yPos += 20;
    
    // Fully Refundable Deposit row
    doc.rect(marginLeft, yPos, tableWidth, 20).stroke();
    doc.moveTo(colStart[4], yPos).lineTo(colStart[4], yPos + 20).stroke();
    
    doc.font('Helvetica')
      .text('Fully Refundable Deposit @ months Rent', colStart[0] + 5, yPos + 7)
      
      
    doc.text(deposit.toString(), colStart[4] + 35, yPos + 7);
    
    yPos += 20;
    
    // One time Transportation row
    doc.rect(marginLeft, yPos, tableWidth, 20).stroke();
    doc.moveTo(colStart[4], yPos).lineTo(colStart[4], yPos + 20).stroke();
    
    doc.text('One time Transportation', colStart[0] + 5, yPos + 7)
      .text('Upto 15 Kms', colStart[1] + 5, yPos + 7);
      
    doc.text(req.body.transportationFee || transportationFee.toString(), colStart[4] + 35, yPos + 7);
    
    yPos += 20;
    
    // Grand Total row
    doc.rect(marginLeft, yPos, tableWidth, 20).stroke();
    doc.moveTo(colStart[4], yPos).lineTo(colStart[4], yPos + 20).stroke();
    
    const grandTotal = monthlyTotal + deposit + transportationFee;
    
    doc.font('Helvetica-Bold')
      .text('Grand Total', colStart[0] + 5, yPos + 7);
      
    doc.text(grandTotal.toString(), colStart[4] + 35, yPos + 7);
    
    yPos += 20;
    
    // Rent payment terms row
    doc.rect(marginLeft, yPos, tableWidth, 20).stroke();
    doc.moveTo(colStart[4], yPos).lineTo(colStart[4], yPos + 20).stroke();
    
    doc.fontSize(10)
      .text('Rent will be due beginning of the month, need to pay before 5th of every month', colStart[0] + 5, yPos + 5);
    
    doc.fontSize(12)
      .text(req.body.paymentTerm || 'Prepaid Rent', colStart[4] + 20, yPos + 7);
    
    yPos += 30;
    
    // Payment instructions
    const advanceAmount = req.body.advanceAmount || 1000;
    
    doc.font('Helvetica')
      .fontSize(11)
      .text(`To confirm the order, you need to pay rupees ${advanceAmount}/- as a token advance in below account and`, marginLeft, yPos)
      .text('the remaining amount to be paid at the time of delivery.', marginLeft, yPos + lineHeight);
    
    yPos += lineHeight * 3;
    
    // Bank details
    const bankName = process.env.BANK_NAME || "AXIS Bank";
    const accountName = process.env.ACCOUNT_NAME || "Preethi Yogesh Navandar";
    const accountNumber = process.env.ACCOUNT_NUMBER || "919010043469563";
    const ifscCode = process.env.IFSC_CODE || "UTIB0003569";
    const upiId = process.env.UPI_ID || "9844723432";
    
    doc.font('Helvetica-Bold')
      .text(`${bankName}`, marginLeft, yPos, { continued: true });
      
    doc.font('Helvetica')
      .text(`: ${accountName} : A/C ${accountNumber} : IFSC- ${ifscCode}`);
    
    yPos += lineHeight;
    doc.text(`Gpay/ Phone Pay/Paytm/Cred: ${upiId}`, marginLeft, yPos);
    
    // Document requirements note
    yPos += lineHeight * 2;
    doc.font('Helvetica-Bold')
      .fillColor(redColor)
      .text('Documents required before delivery: PAN, AADHAR, Company ID and  Rental  Agreement of house', marginLeft, yPos)
      
    
    // REMOVED: Product images section
    
    // Add new page for terms and conditions
    doc.addPage();
    
    // Terms and conditions title
    doc.font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(blackColor)
      .text('TERMS AND CONDITIONS', marginLeft, 50, { align: 'center' });
    
    // Define terms and conditions content
    const termsAndConditions = [
      {
        title: '1. Terms of Agreement',
        content: [
          'The agreement starts when the products are delivered and lasts until the tenure chosen by the customer.',
          'Early closure or extension can be done based on this agreement.'
        ]
      },
      {
        title: '2. Tenure Policy:',
        content: [
          'Early closure incurs charges based on the chosen tenure.',
          'Extension follows the monthly rate applicable at the time of extension.',
          'Rates can be revised by the company at its discretion.'
        ]
      },
      {
        title: '3. Payments',
        content: [
          'The first month\'s rent is charged on prorate basis from the delivery date to end of Month,',
          'Customer need to pay the agreed monthly rent before the 5th of every month via Gpay, Phonepay, paytm or bank transfer. (No cash Accepted)'
        ]
      },
      {
        title: '4. Refundable Deposit',
        content: [
          'A refundable security deposit is collected at the time of ordering the rental items.',
          'It is refunded within 7 to 15 working days after the agreement ends, provided there\'s no damage.',
          'Deductions may occur for damages, non-payment, or default.'
        ]
      },
      {
        title: '5. Confirmation of Order',
        content: [
          'Confirmation occurs after receiving the order and security deposit.',
          'If a product is unavailable, the company may offer a substitute.',
          'KYC verification is required, and orders may be rejected if unsuccessful.'
        ]
      },
      {
        title: '6. Delivery',
        content: [
          'Products are delivered to the specified location as mentioned in the order.',
          'The customer or a representative must be present during delivery.',
          'Quality checks are performed, and any damage must be reported during delivery.'
        ]
      },
      {
        title: '7. Damage',
        content: [
          'Customers are liable for repair or replacement costs for damage, theft, or loss.'
        ]
      }
    ];
    
    // Add terms and conditions to the document
    doc.font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(blackColor)
      .text('TERMS AND CONDITIONS', marginLeft, 50, { align: 'center' });

    let currentY = 80;  // Start a bit lower for better spacing
    const termsLineHeight = 18;  // Increased for better readability
    const bulletPointIndent = 15;
    const contentIndent = bulletPointIndent + 10;

    // Add terms and conditions to the document with better spacing
    termsAndConditions.forEach(term => {
      // Add title with more space above
      currentY += 10; // Extra space before each section
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .text(term.title, marginLeft, currentY);
      
      currentY += termsLineHeight + 5; // More space after title
      
      // Add content with bullet points
      doc.font('Helvetica')
         .fontSize(11);
      
      term.content.forEach(paragraph => {
        // Add bullet point
        doc.text('•', marginLeft + 5, currentY);
        
        // Add paragraph text with indent
        doc.text(paragraph, marginLeft + contentIndent, currentY, {
          width: 495 - contentIndent,
          align: 'left'
        });
        
        // Calculate height needed for this paragraph
        const textHeight = doc.heightOfString(paragraph, {
          width: 495 - contentIndent
        });
        
        // Advance position with calculated height plus padding
        currentY += Math.max(textHeight, termsLineHeight) + 6; // Better spacing between points
      });
      
      currentY += 10; // Add more space between sections
    });

    const remainingTerms = [
      {
        title: '8. Relocation',
        content: [
          'Customers wishing to relocate must request it two weeks in advance.',
          'Relocation is subject to KYC verification and service availability of the new location, but an additional delivery charge will be applicable.'
        ]
      },
      {
        title: '9. Notice',
        content: [
          'Customers need to provide 1 months\' notice to terminate the contract. If the customer wishes to end the contract before the agreed tenure they need to pay full rent for the remaining period.',
          'The company can terminate the agreement for non-payment or breach of terms.'
        ]
      },
      {
        title: '10. Assignment',
        content: [
          'Customers cannot transfer the agreement without written consent.',
          'The company can assign the agreement to third parties without notice.'
        ]
      },
      {
        title: '11. Governing Law',
        content: [
          'The agreement is governed by Indian laws, with exclusive jurisdiction in Bangalore.'
        ]
      },
      {
        title: '12. Limitation of Liability',
        content: [
          'The company\'s liability is limited, and it is not liable for indirect or consequential damages.',
          'The company will not be responsible for any loss or damage to the renter\'s place and human liability due to the malfunction of any item.'
        ]
      },
      {
        title: '13. Refund Policy',
        content: [
          'Cancellation Requests: We can only cancel your order if you ask right after placing it. Once we\'ve told the location partner to send your stuff and they\'ve started, we might not be able to cancel.',
          'Damaged Items: If something arrives damaged, tell our Customer Service team within 2 days. We\'ll sort it out after the delivery team checks and confirms the damage.',
          'Not Working Right: If you\'re not happy with something because it doesn\'t work, you can return it at the time of delivery. Just let us know during delivery because you can\'t return it once our team leaves after confirming the delivery.',
          'Check Product Dimensions: Before you order, check how big things are. If you reject something based on size, we can\'t take it back when it\'s delivered.',
          'Refund Processing: If we approve a refund, it\'ll take about 8-10 days to get the money back in your bank account.'
        ]
      },
      {
        title: '14. REPAIRS, SERVICE & REPLACEMENT',
        content: [
          'After the reporting of any issue or defect burgeoned in the product during usage of the product, Company product experts will analyze the issue and ensure resolution in 7-15 working days. Company appointed third party will repair and/ or service for the issues which have burgeoned in the product due to normal usage. In case after analysis, the Company product experts team finds the issues or defect is due to misuse of the product or damage beyond repair, the customer shall be liable to pay for repair/ service and in case of damage beyond repair customer shall be liable to pay Company the market price of the Product. The decision on service or replacement will be at sole discretion of Company\'s product experts\' team.'
        ]
      }
    ];

    // Apply the same improved formatting to remaining terms
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    remainingTerms.forEach(term => {
      // Check if we need a new page
      if (currentY > 680) { // Start new page earlier to avoid cramped content
        doc.addPage();
        currentY = 50;
      }
      
      // Add title with more space above
      currentY += 10; // Extra space before each section
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .text(term.title, marginLeft, currentY);
      
      currentY += termsLineHeight + 5; // More space after title
      
      // Add content with bullet points
      doc.font('Helvetica')
         .fontSize(11);
      
      term.content.forEach(paragraph => {
        // Check if we need a new page for a long paragraph
        if (currentY > 730) {
          doc.addPage();
          currentY = 50;
        }
        
        // Add bullet point
        doc.text('•', marginLeft + 5, currentY);
        
        // Add paragraph text with indent
        doc.text(paragraph, marginLeft + contentIndent, currentY, {
          width: 495 - contentIndent,
          align: 'left'
        });
        
        // Calculate height needed for this paragraph
        const textHeight = doc.heightOfString(paragraph, {
          width: 495 - contentIndent
        });
        
        // Advance position with calculated height plus padding
        currentY += Math.max(textHeight, termsLineHeight) + 6; // Better spacing between points
      });
      
      currentY += 10; // Add more space between sections
    });
    
    // Get the total number of pages
    const totalPages = doc.bufferedPageCount;
    
    // Add page numbers
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      doc.font('Helvetica')
         .fontSize(10)
         .text(`Page ${i + 1} of ${totalPages}`, 
                marginLeft, 
                800, 
                { align: 'center', width: 500 });
    }
    
    // Finalize the PDF
    doc.end();

    // Wait for PDF to be written
    pdfStream.on('finish', async () => {
      try {
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
              content: fs.readFileSync(pdfPath),
              encoding: 'base64'
            }
          ]
        });

        // Send Invoice to Admin
        await transporter.sendMail({
          from: `"Spot Furnish Rentals" <${process.env.SMTP_USER}>`,
          to: adminEmail,
          subject: `New Quotation Generated - #${invoiceNumber}`,
          html: `<h2>New Quotation Alert</h2><p>A new quotation has been generated for ${customer.address || customer.name}.</p>`,
          attachments: [
            {
              filename: `Quotation-${invoiceNumber}.pdf`,
              content: fs.readFileSync(pdfPath),
              encoding: 'base64'
            }
          ]
        });

        // Clean up the file
        fs.unlinkSync(pdfPath);

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
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        res.status(500).json({ success: false, message: "Failed to send quotation email", error: emailError.message });
      }
    });

  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ success: false, message: "Failed to generate quotation", error: error.message });
  }


  router.use((err, req, res, next) => {
    console.error('💥 Unhandled error in purchaseRoutes:', err);
    res.status(500).json({ success: false, message: 'Server error' ,err:err.message});
  });
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

    


