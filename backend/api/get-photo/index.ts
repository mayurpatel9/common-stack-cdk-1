import { APIGatewayProxyEventV2, Context, APIGatewayProxyResultV2} from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { generateUrl } from  '../get-photos'

const s3 = new S3();
const bucketName = process.env.PHOTO_BUCKET_NAME!;

async function getPhoto(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> {

    console.log("I got bucket name is it's " + bucketName);

    try{
        const {Contents: results} = await s3.listObjects({Bucket: bucketName}).promise();

    const photos = await Promise.all(results!.map(result => generateUrl(result)));

    const photo = photos.at(await between(0, 2));

    return{
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Accept":'*/*',
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(photo)
    };
} catch(error) {
    return{

        statusCode: 500,
        body: JSON.stringify(error)
    }
}

}

async function between(min: number, max: number): Promise<number> {
    return Math.floor(
        Math.random() * (max - min) + min
    )
}

export { getPhoto }