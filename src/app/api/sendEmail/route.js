import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // JSON Request (No Attachments)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      return await sendEmail(body);
    }

    // Multipart FormData Request (With Attachments)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      return await processFormData(formData);
    }

    return NextResponse.json({ success: false, message: "Unsupported Content-Type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ✅ Function to process FormData
async function processFormData(formData) {
  const fields = {};
  const files = [];

  for (const entry of formData.entries()) {
    const [key, value] = entry;

    if (value instanceof Blob) {
      const buffer = Buffer.from(await value.arrayBuffer());
      const filePath = `./public/uploads/${value.name}`;
      await fs.writeFile(filePath, buffer);
      files.push({ filename: value.name, path: filePath });
    } else {
      fields[key] = value;
    }
  }

  return await sendEmail(fields, files);
}

// ✅ Function to send email
async function sendEmail(fields, attachments = []) {
  const { host, sender_email, password, to, subject, text } = fields;

  if (!host || !sender_email || !password || !to || !subject || !text) {
    return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    auth: { user: sender_email, pass: password },
  });

  const info = await transporter.sendMail({
    from: sender_email,
    to,
    subject,
    text,
    attachments,
  });

  // Delete uploaded files after sending email
  await Promise.all(attachments.map((file) => fs.unlink(file.path)));

  return NextResponse.json({ success: true, message: "Email sent!", info });
}
