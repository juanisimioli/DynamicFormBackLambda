const nodemailer = require("nodemailer");
const formidable = require("formidable");

async function endpoint(req, res) {
  try {
    const data = await new Promise(function (resolve, reject) {
      const form = new formidable.IncomingForm({ keepExtensions: true });
      form.parse(req, function (err, fields, files) {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });
    const mailerRes = await mailer(data.fields, data.files.attachment);
    res.send(mailerRes);
  } catch (error) {
    res.send(`error endpoint ${error}`);
  }
}

module.exports = {
  endpoint: endpoint,
};

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_FORM_HOST,
  port: process.env.MAIL_FORM_PORT,
  auth: {
    user: process.env.MAIL_FORM_SMPT_USER,
    pass: process.env.MAIL_FORM_SMPT_PW,
  },
});

const mailer = (formData, file) => {
  const htmlFormData = () => {
    return Object.entries(formData)
      .filter(([key]) => key !== "titleForm")
      .map(([key, value]) => {
        if (key === "File" || key === "OptionSelected") {
          return null;
        }
        return `<div>
          <b>${key}</b> : ${value.toString()}
        </div>`;
      })
      .join("");
  };

  const attachFile = () => {
    if (
      file.type === "application/pdf" ||
      file.type === "application/msword" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return [
        {
          filename: file.name,
          type: file.type,
          path: file.path,
        },
      ];
    } else {
      return [
        {
          filename: "INVALID FILE TYPE",
        },
      ];
    }
  };

  const message = {
    from: process.env.MAIL_FORM_SMPT_USER,
    to: formData.Email,
    subject: `DYNAMIC FORM/ ${formData.titleForm} (LAMBDA)`,
    html: `<b>${formData.titleForm} FIELDS:</b>
    ${htmlFormData()}`,
    attachments: file && attachFile(),
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(message, (error, info) =>
      error ? reject(error) : resolve(info)
    );
  });
};
