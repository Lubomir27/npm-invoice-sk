const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path, logoBackground, logoUrl, customer) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc, invoice, logoBackground, logoUrl);
  generateCustomerInformation(doc, invoice, customer);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc, invoice, logoBackground, logoUrl) {
  doc
    .rect(50, 40, 120, 40)
    .fill(`${logoBackground || "#ffffff"}`)
    .image(`${logoUrl}`, 60, 45, {
      width: 100,
      align: "center",
      valign: "center",
    })
    .fillColor("#444444")
    .font("./Roboto-Medium.ttf")
    .fontSize(10)
    .fillColor("#aaaaaa")
    .text("DODÁVATEĽ", 50, 95)
    .fillColor("#000000")
    .text(`${invoice.sender.firstLine}`, 50, 110)
    .text(`${invoice.sender.secondLine}`, 50, 125)
    .text(`${invoice.sender.thirdLine}`, 50, 140)
    .text(`${invoice.sender.ico}`, 50, 155)
    .text(`${invoice.sender.dic}`, 50, 170)
    .fillColor("#aaaaaa")
    .text("ODOBERATEĽ", 250, 95)
    .font("./Roboto-Bold.ttf")
    .fillColor("#000000")
    .text(invoice.shipping.name, 250, 110)
    .font("./Roboto-Medium.ttf")
    .text(invoice.shipping.address, 250, 125)
    .text(
      `${invoice.shipping.postal_code + ", " + invoice.shipping.city}`,
      250,
      140
    )
    .text(invoice.shipping.email, 250, 155)
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .font("./Roboto-Medium.ttf")
    .text("Faktúra", 50, 205);

  generateHr(doc, 235);

  const customerInformationTop = 240;

  doc
    .fontSize(10)
    .text("Číslo:", 50, customerInformationTop)
    .font("./Roboto-Bold.ttf")
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font("./Roboto-Medium.ttf")
    .text("Dátum vystavenia:", 50, customerInformationTop + 15)
    .text(formatDate(new Date(), 0), 150, customerInformationTop + 15)
    .text("Dátum dodania:", 50, customerInformationTop + 30)
    .text(formatDate(new Date(), 0), 150, customerInformationTop + 30)
    .text("Dátum splatnosti:", 50, customerInformationTop + 45)
    .text(formatDate(new Date(), 14), 150, customerInformationTop + 45)
    .text(`${invoice.additionalInfo || ""}`, 50, customerInformationTop + 70, {
      align: "center",
    });

  generateHr(doc, 337);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 360;

  doc.font("./Roboto-Bold.ttf");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Názov Produktu",
    "Trvanie",
    "Počet",
    "Cena bez DPH",
    "DPH",
    "Spolu s DPH"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("./Roboto-Medium.ttf");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.duration,
      item.quantity,
      formatCurrency(item.priceInCents * 0.8),
      "20%",
      formatCurrency(item.priceInCents)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "",
    "Základ DPH 20%",
    "",
    formatCurrency(invoice.subtotal * 0.8)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "",
    "DPH 20%",
    "",
    formatCurrency((invoice.subtotal - invoice.discountValue) * 0.2)
  );
  const discountPosition = paidToDatePosition + 20;
  generateTableRow(
    doc,
    discountPosition,
    "",
    "",
    "",
    `Zľava ${invoice.discountPercent + "%"}`,
    "",
    formatCurrency(invoice.discountValue)
  );

  const duePosition = paidToDatePosition + 40;
  doc.font("./Roboto-Bold.ttf");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "",
    "Celkom",
    "",
    formatCurrency(invoice.subtotal - invoice.discountValue)
  );

  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc.font("./Roboto-Bold.ttf").fontSize(10).text("Strana 1/1", 50, 780, {
    align: "center",
    width: 500,
  });
}

function generateTableRow(
  doc,
  y,
  item,
  duration,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(duration, 170, y)
    .text(description, 250, y)
    .text(unitCost, 310, y, { width: 90, align: "left" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(cents) {
  return (cents / 100).toFixed(2) + "€";
}

function formatDate(date, plusDays) {
  date.setDate(date.getDate() + plusDays);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return day + "." + month + "." + year;
}

module.exports = {
  createInvoice,
};
