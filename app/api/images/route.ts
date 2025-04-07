import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  region: process.env.AWS_REGION,
});

export async function getS3ImageUrl(imageUrl: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: imageUrl,
    });

    const url = await getSignedUrl(s3, command);

    return url;
  } catch (error) {
    console.error("Error fetching image from S3:", error);
    return "Error fetching image from S3";
  }
}
