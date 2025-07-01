/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: false // we use formidable for multipart
  }
};
module.exports = nextConfig;
