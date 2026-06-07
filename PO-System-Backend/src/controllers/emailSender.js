import pool from "../db.js";
import { Resend } from "resend";

const resend = new Resend(process.env.EMAIL_API);

export async function sendNewReqEmail(rfqId, currentUserId) {
  try {
    // const { rfqId, currentUserId } = req.body;
    const [rfqResult] = await pool.query(
      `SELECT r.*, d.name as department_name 
             FROM rfqs r 
             LEFT JOIN departments d ON r.department_id = d.department_id
             WHERE r.rfq_id = ?`,
      [rfqId]
    );
    console.log("1 complete");
    if (rfqResult.length === 0) {
      throw new Error('RFQ not found');
    }

    const rfqs = rfqResult[0];

    // 2. Get the requestor's details
    const [requestorResult] = await pool.query(
      `SELECT username, email FROM users WHERE user_id = ?`,
      [currentUserId]
    );
    console.log("2 complete");
    const requestor = requestorResult[0];

    // 3. Get all RFQ items
    const [itemsResult] = await pool.query(
      `SELECT * FROM rfq_items WHERE rfq_id = ?`,
      [rfqId]
    );
    console.log("3 complete");

    // 4. Get all users who can approve (role_id = 1 or 2)
    const [approversResult] = await pool.query(
      `SELECT DISTINCT u.user_id, u.email, u.username
             FROM user_role ur
             JOIN users u ON ur.user_id = u.user_id
             WHERE ur.role_id IN (1, 2) AND u.user_id != ?`,
      [currentUserId] // Exclude the requestor
    );
    console.log("4 complete");

    // 5. Prepare HTML content for the email
    let itemsHtml = '';
    if (itemsResult.length > 0) {
      itemsResult.forEach(item => {
        itemsHtml += `
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.item_name}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${item.est_unit_price || 'N/A'}</td>
                    </tr>
                `;
      });
    } else {
      itemsHtml = `<tr><td colspan="3" style="padding: 8px; text-align: center;">No items listed</td></tr>`;
    }
    console.log("4 complete");

    // 6. Send email to each approver
    for (const approver of approversResult) {
      const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
                        .header { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                        .details { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th { background-color: #f2f2f2; padding: 12px; text-align: left; }
                        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                        .button { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>New Request: ${rfqs.title}</h2>
                        </div>

                        <div class="details">
                            <p><strong>Request ID:</strong> RFQ-${rfqs.rfq_id}</p>
                            <p><strong>Department:</strong> ${rfqs.department_name}</p>
                            <p><strong>Description:</strong> ${rfqs.description}</p>
                            <p><strong>Status:</strong> ${rfqs.status}</p>
                            <p><strong>Requested By:</strong> ${requestor.username} (${requestor.email})</p>
                            <p><strong>Created Date:</strong> ${new Date(rfqs.created_at).toLocaleString()}</p>
                        </div>

                        <h3>Request Items:</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th style="padding: 12px; background-color: #f2f2f2;">Item Name</th>
                                    <th style="padding: 12px; background-color: #f2f2f2;">Quantity</th>
                                    <th style="padding: 12px; background-color: #f2f2f2;">Estimated Unit Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <p>
                            <a href="${process.env.FRONTEND_URL}/rfqs/${rfqs.rfq_id}" class="button">
                                View & Approve Request
                            </a>
                        </p>

                        <div class="footer">
                            <p>This is an automated notification. Please do not reply to this email.</p>
                            <p>© ${new Date().getFullYear()} Purchase Order System</p>
                        </div>
                    </div>
                </body>
                </html>
            `;
      console.log(requestor.email);
      console.log(approver.email);
      console.log(rfqs.title);

      // 7. Send email using Resend
      try {
        await resend.emails.send({
          from: 'Acme <onboarding@resend.dev>',
          to: 'fs21co023.tanmay@gmail.com',
          subject: `New Request: ${rfqs.title}`,
          html: htmlContent
        });
        // try {
        //   await resend.emails.send({
        //     from: 'Acme <onboarding@resend.dev>',
        //     to: "fs21co023.tanmay@gmail.comm",
        //     subject: `hello`,
        //     html: '<h1>Good Morning</h1>'
        //   });

        console.log(`Email sent to ${approver.email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${approver.email}:`, emailError);
        // Continue with other approvers even if one fails
      }
    }
    console.log(`Emails sent to ${approversResult.length} approvers for RFQ ${rfqId}`);
    return {
      success: true,
      message: `Notifications sent to ${approversResult.length} approvers`,
      rfqId: rfqId
    };


  } catch (error) {
    console.error('Error in sendNewRFQEmail:', error);
    throw error;
  }
};

// import { Resend } from "resend";
// import pool from "../db.js";


// const apiKey = process.env.EMAIL_API || "";
// const resend = new Resend(apiKey);

// export async function sendNewReqEmail(rfqId, currentUserId) {
//   try {
//     console.log("RESEND API KEY present?:", !!apiKey);

//     // --- (your DB queries here unchanged) ---
//     // ... fetch rfqResult, requestorResult, itemsResult, approversResult ...
//     // I'll assume you already have rfqs, requestor and approversResult.

//     // quick test send to just one known recipient (replace with approver.email)
//     const testTo = "omkokate2535@gmail.com";

//     const { data, error } = await resend.emails.send({
//       from: 'Acme <onboarding@resend.dev>',
//       to: [testTo],
//       subject: 'hello world',
//       html: '<p>it works!</p>',
//       replyTo: 'onboarding@resend.dev',
//     });

//     // console.log("Resend SDK result:", result); // logs { data } or throws
//     // If the SDK returns { data, error } pattern:
//     // const { data, error } = await resend.emails.send(...);
//     // console.log('data', data, 'error', error);

//     return {
//       success: true,
//       message: "Email sent",
//     };
//   } catch (err) {
//     console.error("sendNewReqEmail error ->", err);
//     throw err;
//   }
// }
