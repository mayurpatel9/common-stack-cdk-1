import { APIGatewayProxyEventV2, Context, APIGatewayProxyResultV2} from 'aws-lambda';
import {S3} from 'aws-sdk';

const s3 = new S3();
const bucketName = process.env.PHOTO_BUCKET_NAME!;

async function getPhotos(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> {

    console.log("I got bucket name is it's " + bucketName);

    try{
        const {Contents: results} = await s3.listObjects({Bucket: bucketName}).promise();

    const photos = await Promise.all(results!.map(result => generateUrl(result)));
    return{
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Accept":'*/*',
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(photos)
    };
} catch(error) {
    return{
         statusCode: 500,
        body: JSON.stringify(error)
    }
}

}

async function generateUrl(object: S3.Object): Promise<{fileName: string, url: string}> {
    const url = await s3.getSignedUrlPromise('getObject',{
        Bucket: bucketName,
        Key: object.Key,
    });
    return{
        fileName: object.Key!,
        url
    }
}
export { getPhotos, generateUrl }


