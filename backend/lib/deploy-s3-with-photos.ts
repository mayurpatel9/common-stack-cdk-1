import { Stack, RemovalPolicy, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Bucket, BucketEncryption, IBucket } from 'aws-cdk-lib/aws-s3';
import * as path from 'path';

interface DeployS3WithPhotoProps extends StackProps {
    encryption: BucketEncryption,
    deployTo: string[]
}

export class DeployS3WithPhoto extends Stack {

    public readonly bucket: IBucket;

    constructor(scope: Construct, id: string, props: DeployS3WithPhotoProps) {
        super(scope, id, props);

        this.bucket = new Bucket(this, 'MyS3Bucket', {
            encryption: props.encryption,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

        //Bucket deployment
        new BucketDeployment(this, 'MyS3BucketApp', {
            sources: [
                Source.asset(path.join(__dirname, ...props.deployTo))
            ],
            destinationBucket: this.bucket
        });
    }
}