import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function POST(req) {
  let filePaths = [];

  try {
    const formData = await req.formData();
    const subject = formData.get("subject");
    const description = formData.get("body"); // HTML content
    const files = formData.getAll("files"); // Get multiple files
    const to = formData.get("to");
    const host = formData.get("host");
    const sender_email = formData.get("sender_email");
    const sender_password = formData.get("sender_password");

    console.log(host, sender_email, sender_password);
    const tmpDir = path.join(process.cwd(), "tmp");
    await mkdir(tmpDir, { recursive: true });

    const transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      requireTLS: true,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: sender_email,
        pass: sender_password,
      },
    });

    await transporter.verify();

    let attachments = [];
    for (const file of files) {
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const fileName = `${timestamp}-${file.name}`;
        const filePath = path.join(tmpDir, fileName);
        await writeFile(filePath, buffer);
        filePaths.push(filePath);

        attachments.push({
          filename: file.name,
          path: filePath,
          contentType: file.type,
        });
      }
    }

    const mailOptions = {
      from: sender_email,
      to: to,
      subject: subject,
      html: description, // Changed from 'text' to 'html' to support formatted content
      attachments: attachments,
    };

    console.log(
      "Sending email with options:",
      JSON.stringify(mailOptions, null, 2)
    );
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    // Cleanup all temporary files
    for (const filePath of filePaths) {
      try {
        await unlink(filePath);
      } catch (err) {
        console.error("Error deleting temporary file:", err);
      }
    }

    return NextResponse.json(
      { message: "Email sent successfully", info },
      { status: 200 }
    );
  } catch (error) {
    // Cleanup files if error occurs
    for (const filePath of filePaths) {
      try {
        await unlink(filePath);
      } catch (err) {
        console.error("Error deleting temporary file:", err);
      }
    }

    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
