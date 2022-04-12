import { Stack, CfnOutput, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement, Policy, Effect, CanonicalUserPrincipal } from 'aws-cdk-lib/aws-iam';
import { ARecord, HostedZone, RecordTarget, IPublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Bucket, HttpMethods, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from "aws-cdk-lib/aws-iam";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { DeployS3WithPhoto } from './deploy-s3-with-photos';


interface PersonalStackProps extends StackProps{
  dnsName: string,
  hostedZone: IPublicHostedZone,
  certificate: ICertificate
}

export class  PersonalStack extends Stack {
  constructor(scope: Construct, id: string, props: PersonalStackProps) {
    super(scope, id, props);

    const {bucket} = new DeployS3WithPhoto(this, 'DeployS3WithPhotoBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      deployTo: ['..', 'photos']
    });

    //Website host bucket
    const websiteBucket = new Bucket(this, 'MyWebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      
      cors: [
        {
          allowedHeaders: Cors.DEFAULT_HEADERS,
          allowedMethods: [
            HttpMethods.GET,
            HttpMethods.POST
          ],
          allowedOrigins: Cors.ALL_ORIGINS,
          maxAge: 3000,
        },
      ],
    });
    
    //deploy cloud Front
    const cloudFront = new Distribution(this, 'MyWebsiteDistribution', {
      defaultBehavior: {origin: new S3Origin(websiteBucket)},
      domainNames: [props.dnsName],
      certificate: props.certificate
    })
    cloudFront.applyRemovalPolicy(RemovalPolicy.DESTROY);

    //A Record
    const aRecord = new ARecord(this, 'PersonalARecord', {
      zone: props.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudFront))
    })
    aRecord.applyRemovalPolicy(RemovalPolicy.DESTROY);
    
    
    //Website host bucket permission
    const websitePermission = new iam.PolicyStatement();
    websitePermission.addResources(websiteBucket.bucketArn);
    websitePermission.addPrincipals(new iam.AnyPrincipal());
    websitePermission.addActions('s3:ListBucket');

    const websiteBucketPermission = new iam.PolicyStatement();
    websiteBucketPermission.addResources(`${websiteBucket.bucketArn}/*`);
    websiteBucketPermission.addActions('s3:GetObject', 's3:PutObject');
    websiteBucketPermission.addPrincipals(new iam.AnyPrincipal());


    websiteBucket.addToResourcePolicy(websitePermission);
    websiteBucket.addToResourcePolicy(websiteBucketPermission);

    //Deploy frontend
    new BucketDeployment(this, 'MyWebsiteDeployment', {
      sources: [Source.asset(path.join(__dirname, '..', '..', 'frontend', 'build'))],
      destinationBucket: websiteBucket,
      distribution: cloudFront
    });

    //Lambda Function Get Photo 
    const getPhotoLambda = new lambda.NodejsFunction(this, 'GetPhotoLambda', {
      runtime: Runtime.NODEJS_12_X,
      entry: path.join(__dirname, '..', 'api', 'get-photo', 'index.ts'),
      handler: 'getPhoto',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName
      }
    });

    const getPhotoContainerPermission = new iam.PolicyStatement();
    getPhotoContainerPermission.addResources(bucket.bucketArn);
    getPhotoContainerPermission.addActions('s3:ListBucket');

    const bucketGetPhotoPermission = new iam.PolicyStatement();
    bucketGetPhotoPermission.addResources(`${bucket.bucketArn}/*`);
    bucketGetPhotoPermission.addActions('s3:GetObject', 's3:PutObject');

    getPhotoLambda.addToRolePolicy(getPhotoContainerPermission);
    getPhotoLambda.addToRolePolicy(bucketGetPhotoPermission);

    //Lambda Function Get All Photos
    const getPhotosLambda = new lambda.NodejsFunction(this, 'MySimpleAppLambda', {
      runtime: Runtime.NODEJS_12_X,
      entry: path.join(__dirname, '..', 'api', 'get-photos', 'index.ts'),
      handler: 'getPhotos',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName
      }
    });

    const bucketContainerPermission = new iam.PolicyStatement();
    bucketContainerPermission.addResources(bucket.bucketArn);
    bucketContainerPermission.addActions('s3:ListBucket');

    const bucketPermission = new iam.PolicyStatement();
    bucketPermission.addResources(`${bucket.bucketArn}/*`);
    bucketPermission.addActions('s3:GetObject', 's3:PutObject');

    getPhotosLambda.addToRolePolicy(bucketContainerPermission);
    getPhotosLambda.addToRolePolicy(bucketPermission);

    //Set up Api Gateway
    const api = new apigateway.RestApi(this, 'Personal-api-gw', {
      restApiName: 'photo-api',
      description: 'Personal Api Gateway',
     
      defaultCorsPreflightOptions:{
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowOrigins: ['*'],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
      
    });
    
    api.applyRemovalPolicy(RemovalPolicy.DESTROY);

    getPhotosLambda.applyRemovalPolicy(RemovalPolicy.DESTROY);
    getPhotoLambda.applyRemovalPolicy(RemovalPolicy.DESTROY);

    //Integrate lambda with APIGateway GetPhotos
    const getPhotos = api.root.addResource('getPhotos');
    getPhotos.addMethod('GET', new apigateway.LambdaIntegration(getPhotosLambda));

    //Integrate lambda with APIGateway getPhoto
    const getPhoto = api.root.addResource('getPhoto');
    getPhoto.addMethod('GET', new apigateway.LambdaIntegration(getPhotoLambda));

    //out put : Photo Deployed Bucket Name
    new CfnOutput(this, 'MyS3BucketNameExport', {
      value: bucket.bucketName,
      exportName: `MyS3BucketName`
    });

    //out put : Website Bucket Name
    new CfnOutput(this, 'MyAppWebsiteBucketNameExport', {
      value: websiteBucket.bucketName,
      exportName: `MyAppWebsiteBucketName`
    });
    
    //out put : Website URL
    new CfnOutput(this, 'MyWebsiteUrl', {
      value: cloudFront.distributionDomainName,
      exportName: `MyAppWebsiteUrl`
    });
      
    //out put : Bucket Website URL
    new CfnOutput(this, 'MyAppWebsiteBucketUrlExport', {
      value: websiteBucket.bucketWebsiteUrl,
      exportName: `MyAppWebsiteBucketUrlExport`
    });
  }
}
