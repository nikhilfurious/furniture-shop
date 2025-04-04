import React, { useState } from 'react';

const TermsAndPrivacy = () => {
  const [activeTab, setActiveTab] = useState('terms');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-center space-x-4 mb-6">
        <button className={`px-4 py-2 rounded ${activeTab === 'terms' ? 'bg-green-500 text-white' : 'bg-gray-300'}`} onClick={() => handleTabClick('terms')}>Terms and Conditions</button>
        <button className={`px-4 py-2 rounded ${activeTab === 'privacy' ? 'bg-green-500 text-white' : 'bg-gray-300'}`} onClick={() => handleTabClick('privacy')}>Privacy Policy</button>
      </div>

      {activeTab === 'terms' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Terms and Conditions</h2>
          <p>1. Terms of Agreement: The agreement starts when the products are delivered and lasts until the fixed period chosen by the customer. Multiple tenure options are available at the time of booking. Early closure or extension is based on this agreement.</p>
          <p>2. Tenure Policy: Early closure incurs charges based on the chosen tenure. Extension follows the monthly rate applicable at the time of extension. Rates may be revised by Furnish Rent.</p>
          <p>3. Payments: Invoices are generated on the delivery day, with payment due on the delivered date of each month. The first month’s rent is deducted on the delivery date. Payments are automatically deducted from the card used at the time of ordering. Customers must manually initiate monthly payments via the Furnish Rent platform.</p>
          <p>4. Refundable Deposit: A refundable deposit is collected when ordering rental items, refunded within 15-21 working days post-agreement, provided no damage occurs.</p>
          <p>5. Confirmation of Order: Confirmation happens after receiving the order and security deposit. If unavailable, a substitute is offered. KYC verification is required.</p>
          <p>6. Delivery: Delivered to the specified location. Presence during delivery is required for quality checks.</p>
          <p>7. Damage: Customers are responsible for repair or replacement costs due to damage, theft, or loss. Minor wear and tear are normal.</p>
          <p>8. Relocation: Relocation requests must be made two weeks in advance and are subject to service availability and KYC verification.</p>
          <p>9. Termination: The agreement ends on the last day of the rental term. Furnish Rent may terminate for non-payment or breach of terms.</p>
          <p>10. Assignment: Customers cannot transfer the agreement without written consent.</p>
          <p>11. Indemnification: Customers indemnify Furnish Rent against claims except for negligence by Furnish Rent.</p>
          <p>12. Governing Law: Governed by Indian laws with exclusive jurisdiction in Kolkata.</p>
          <p>13. Limitation of Liability: Furnish Rent is not liable for indirect or consequential damages.</p>
          <p>14. Refund Policy: Orders can be canceled right after placing them. Damaged items must be reported within 2 days. Refunds take 8-10 days to process.</p>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Privacy Policy</h2>
          <p>Furnish Rent is committed to protecting your privacy. The following information is collected when you use our website: Name, Contact Information, Mobile Number, Address.</p>
          <p>How We Use Your Information: Internal record keeping, delivery, promotional emails, and market research.</p>
          <p>Security Measures: We ensure your data's security to prevent unauthorized access.</p>
          <p>Use of Cookies: Cookies personalize your experience. You can accept or decline cookies through browser settings.</p>
          <p>Controlling Your Personal Information: You can manage your information by indicating preferences or contacting us for corrections.</p>
        </div>
      )}
    </div>
  );
};

export default TermsAndPrivacy;
