const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
	const Bucket = event.Records[0].s3.bucket.name;
	const Key = decodeURIComponent(event.Records[0].object.key);
	const filename = Key.split('/')[Key.split('/').length - 1];
	const ext = Key.split('.')[Key.split('.').length - 1].toLowerCase();
	const requiredFormat = ext === 'jpg' ? 'jpeg' : ext;	//sharp에서는 jpg대신 jpeg를 사용함

	try {
		const s3Object = await s3.getObject({ Bucket, Key }).promise();
		const resizedImage = await sharp(s3Object.Body)
			.resize(200, 200, { fit: 'inside' })
			.toFormat(requiredFormat)
			.toBuffer();
		await s3.putObject({
			Bucket,
			Key: `thumb-com-post/${filename}`,
			Body: resizedImage,
		}).promise();
		return callback(null, `thumb-com-post/${filename}`);
	}
	catch (err) {
		console.error(err);
		return callback(err);
	}
}