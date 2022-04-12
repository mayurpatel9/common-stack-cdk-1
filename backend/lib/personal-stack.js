"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_lambda_1 = require("aws-cdk-lib/aws-lambda");
const aws_route53_1 = require("aws-cdk-lib/aws-route53");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const lambda = __importStar(require("aws-cdk-lib/aws-lambda-nodejs"));
const path = __importStar(require("path"));
const aws_s3_deployment_1 = require("aws-cdk-lib/aws-s3-deployment");
const aws_cloudfront_origins_1 = require("aws-cdk-lib/aws-cloudfront-origins");
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const aws_cloudfront_1 = require("aws-cdk-lib/aws-cloudfront");
const aws_apigateway_1 = require("aws-cdk-lib/aws-apigateway");
const aws_route53_targets_1 = require("aws-cdk-lib/aws-route53-targets");
const deploy_s3_with_photos_1 = require("./deploy-s3-with-photos");
class PersonalStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        const { bucket } = new deploy_s3_with_photos_1.DeployS3WithPhoto(this, 'DeployS3WithPhotoBucket', {
            encryption: aws_s3_1.BucketEncryption.S3_MANAGED,
            deployTo: ['..', 'photos']
        });
        //Website host bucket
        const websiteBucket = new aws_s3_1.Bucket(this, 'MyWebsiteBucket', {
            websiteIndexDocument: 'index.html',
            publicReadAccess: true,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            cors: [
                {
                    allowedHeaders: aws_apigateway_1.Cors.DEFAULT_HEADERS,
                    allowedMethods: [
                        aws_s3_1.HttpMethods.GET,
                        aws_s3_1.HttpMethods.POST
                    ],
                    allowedOrigins: aws_apigateway_1.Cors.ALL_ORIGINS,
                    maxAge: 3000,
                },
            ],
        });
        //deploy cloud Front
        const cloudFront = new aws_cloudfront_1.Distribution(this, 'MyWebsiteDistribution', {
            defaultBehavior: { origin: new aws_cloudfront_origins_1.S3Origin(websiteBucket) },
            domainNames: [props.dnsName],
            certificate: props.certificate
        });
        cloudFront.applyRemovalPolicy(aws_cdk_lib_1.RemovalPolicy.DESTROY);
        //A Record
        const aRecord = new aws_route53_1.ARecord(this, 'PersonalARecord', {
            zone: props.hostedZone,
            target: aws_route53_1.RecordTarget.fromAlias(new aws_route53_targets_1.CloudFrontTarget(cloudFront))
        });
        aRecord.applyRemovalPolicy(aws_cdk_lib_1.RemovalPolicy.DESTROY);
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
        new aws_s3_deployment_1.BucketDeployment(this, 'MyWebsiteDeployment', {
            sources: [aws_s3_deployment_1.Source.asset(path.join(__dirname, '..', '..', 'frontend', 'build'))],
            destinationBucket: websiteBucket,
            distribution: cloudFront
        });
        //Lambda Function Get Photo 
        const getPhotoLambda = new lambda.NodejsFunction(this, 'GetPhotoLambda', {
            runtime: aws_lambda_1.Runtime.NODEJS_12_X,
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
            runtime: aws_lambda_1.Runtime.NODEJS_12_X,
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
            defaultCorsPreflightOptions: {
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
        api.applyRemovalPolicy(aws_cdk_lib_1.RemovalPolicy.DESTROY);
        getPhotosLambda.applyRemovalPolicy(aws_cdk_lib_1.RemovalPolicy.DESTROY);
        getPhotoLambda.applyRemovalPolicy(aws_cdk_lib_1.RemovalPolicy.DESTROY);
        //Integrate lambda with APIGateway GetPhotos
        const getPhotos = api.root.addResource('getPhotos');
        getPhotos.addMethod('GET', new apigateway.LambdaIntegration(getPhotosLambda));
        //Integrate lambda with APIGateway getPhoto
        const getPhoto = api.root.addResource('getPhoto');
        getPhoto.addMethod('GET', new apigateway.LambdaIntegration(getPhotoLambda));
        //out put : Photo Deployed Bucket Name
        new aws_cdk_lib_1.CfnOutput(this, 'MyS3BucketNameExport', {
            value: bucket.bucketName,
            exportName: `MyS3BucketName`
        });
        //out put : Website Bucket Name
        new aws_cdk_lib_1.CfnOutput(this, 'MyAppWebsiteBucketNameExport', {
            value: websiteBucket.bucketName,
            exportName: `MyAppWebsiteBucketName`
        });
        //out put : Website URL
        new aws_cdk_lib_1.CfnOutput(this, 'MyWebsiteUrl', {
            value: cloudFront.distributionDomainName,
            exportName: `MyAppWebsiteUrl`
        });
        //out put : Bucket Website URL
        new aws_cdk_lib_1.CfnOutput(this, 'MyAppWebsiteBucketUrlExport', {
            value: websiteBucket.bucketWebsiteUrl,
            exportName: `MyAppWebsiteBucketUrlExport`
        });
    }
}
exports.PersonalStack = PersonalStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uYWwtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwZXJzb25hbC1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQTBFO0FBRTFFLHVEQUFpRTtBQUVqRSx5REFBK0Y7QUFFL0YsK0NBQTJFO0FBQzNFLHNFQUF3RDtBQUN4RCwyQ0FBNkI7QUFDN0IscUVBQXlFO0FBQ3pFLCtFQUE4RDtBQUM5RCx5REFBMkM7QUFDM0MsdUVBQXlEO0FBQ3pELCtEQUEwRDtBQUMxRCwrREFBa0Q7QUFDbEQseUVBQW1FO0FBQ25FLG1FQUE0RDtBQVM1RCxNQUFjLGFBQWMsU0FBUSxtQkFBSztJQUN2QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXlCO1FBQ2pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLE1BQU0sRUFBQyxNQUFNLEVBQUMsR0FBRyxJQUFJLHlDQUFpQixDQUFDLElBQUksRUFBRSx5QkFBeUIsRUFBRTtZQUN0RSxVQUFVLEVBQUUseUJBQWdCLENBQUMsVUFBVTtZQUN2QyxRQUFRLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDO1NBQzNCLENBQUMsQ0FBQztRQUVILHFCQUFxQjtRQUNyQixNQUFNLGFBQWEsR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDeEQsb0JBQW9CLEVBQUUsWUFBWTtZQUNsQyxnQkFBZ0IsRUFBRSxJQUFJO1lBQ3RCLGFBQWEsRUFBRSwyQkFBYSxDQUFDLE9BQU87WUFDcEMsaUJBQWlCLEVBQUUsSUFBSTtZQUV2QixJQUFJLEVBQUU7Z0JBQ0o7b0JBQ0UsY0FBYyxFQUFFLHFCQUFJLENBQUMsZUFBZTtvQkFDcEMsY0FBYyxFQUFFO3dCQUNkLG9CQUFXLENBQUMsR0FBRzt3QkFDZixvQkFBVyxDQUFDLElBQUk7cUJBQ2pCO29CQUNELGNBQWMsRUFBRSxx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dUJBQVMsQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLEVBQUU7WUFDMUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxVQUFVO1lBQ3hCLFVBQVUsRUFBRSxnQkFBZ0I7U0FDN0IsQ0FBQyxDQUFDO1FBRUgsK0JBQStCO1FBQy9CLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLEVBQUU7WUFDbEQsS0FBSyxFQUFFLGFBQWEsQ0FBQyxVQUFVO1lBQy9CLFVBQVUsRUFBRSx3QkFBd0I7U0FDckMsQ0FBQyxDQUFDO1FBRUgsdUJBQXVCO1FBQ3ZCLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ2xDLEtBQUssRUFBRSxVQUFVLENBQUMsc0JBQXNCO1lBQ3hDLFVBQVUsRUFBRSxpQkFBaUI7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsOEJBQThCO1FBQzlCLElBQUksdUJBQVMsQ0FBQyxJQUFJLEVBQUUsNkJBQTZCLEVBQUU7WUFDakQsS0FBSyxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0I7WUFDckMsVUFBVSxFQUFFLDZCQUE2QjtTQUMxQyxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFwS0Qsc0NBb0tDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3RhY2ssIENmbk91dHB1dCwgU3RhY2tQcm9wcywgUmVtb3ZhbFBvbGljeSB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuaW1wb3J0IHsgRnVuY3Rpb24sIFJ1bnRpbWUsIENvZGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGFtYmRhJztcbmltcG9ydCB7IFBvbGljeVN0YXRlbWVudCwgUG9saWN5LCBFZmZlY3QsIENhbm9uaWNhbFVzZXJQcmluY2lwYWwgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IEFSZWNvcmQsIEhvc3RlZFpvbmUsIFJlY29yZFRhcmdldCwgSVB1YmxpY0hvc3RlZFpvbmUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgeyBJQ2VydGlmaWNhdGUgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2VydGlmaWNhdGVtYW5hZ2VyJztcbmltcG9ydCB7IEJ1Y2tldCwgSHR0cE1ldGhvZHMsIEJ1Y2tldEVuY3J5cHRpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEtbm9kZWpzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBCdWNrZXREZXBsb3ltZW50LCBTb3VyY2UgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMtZGVwbG95bWVudCc7XG5pbXBvcnQgeyBTM09yaWdpbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtaWFtXCI7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCB7IERpc3RyaWJ1dGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCB7IENvcnMgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgeyBDbG91ZEZyb250VGFyZ2V0IH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXJvdXRlNTMtdGFyZ2V0cyc7XG5pbXBvcnQgeyBEZXBsb3lTM1dpdGhQaG90byB9IGZyb20gJy4vZGVwbG95LXMzLXdpdGgtcGhvdG9zJztcblxuXG5pbnRlcmZhY2UgUGVyc29uYWxTdGFja1Byb3BzIGV4dGVuZHMgU3RhY2tQcm9wc3tcbiAgZG5zTmFtZTogc3RyaW5nLFxuICBob3N0ZWRab25lOiBJUHVibGljSG9zdGVkWm9uZSxcbiAgY2VydGlmaWNhdGU6IElDZXJ0aWZpY2F0ZVxufVxuXG5leHBvcnQgY2xhc3MgIFBlcnNvbmFsU3RhY2sgZXh0ZW5kcyBTdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBQZXJzb25hbFN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIGNvbnN0IHtidWNrZXR9ID0gbmV3IERlcGxveVMzV2l0aFBob3RvKHRoaXMsICdEZXBsb3lTM1dpdGhQaG90b0J1Y2tldCcsIHtcbiAgICAgIGVuY3J5cHRpb246IEJ1Y2tldEVuY3J5cHRpb24uUzNfTUFOQUdFRCxcbiAgICAgIGRlcGxveVRvOiBbJy4uJywgJ3Bob3RvcyddXG4gICAgfSk7XG5cbiAgICAvL1dlYnNpdGUgaG9zdCBidWNrZXRcbiAgICBjb25zdCB3ZWJzaXRlQnVja2V0ID0gbmV3IEJ1Y2tldCh0aGlzLCAnTXlXZWJzaXRlQnVja2V0Jywge1xuICAgICAgd2Vic2l0ZUluZGV4RG9jdW1lbnQ6ICdpbmRleC5odG1sJyxcbiAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IHRydWUsXG4gICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSxcbiAgICAgIFxuICAgICAgY29yczogW1xuICAgICAgICB7XG4gICAgICAgICAgYWxsb3dlZEhlYWRlcnM6IENvcnMuREVGQVVMVF9IRUFERVJTLFxuICAgICAgICAgIGFsbG93ZWRNZXRob2RzOiBbXG4gICAgICAgICAgICBIdHRwTWV0aG9kcy5HRVQsXG4gICAgICAgICAgICBIdHRwTWV0aG9kcy5QT1NUXG4gICAgICAgICAgXSxcbiAgICAgICAgICBhbGxvd2VkT3JpZ2luczogQ29ycy5BTExfT1JJR0lOUyxcbiAgICAgICAgICBtYXhBZ2U6IDMwMDAsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICAgIFxuICAgIC8vZGVwbG95IGNsb3VkIEZyb250XG4gICAgY29uc3QgY2xvdWRGcm9udCA9IG5ldyBEaXN0cmlidXRpb24odGhpcywgJ015V2Vic2l0ZURpc3RyaWJ1dGlvbicsIHtcbiAgICAgIGRlZmF1bHRCZWhhdmlvcjoge29yaWdpbjogbmV3IFMzT3JpZ2luKHdlYnNpdGVCdWNrZXQpfSxcbiAgICAgIGRvbWFpbk5hbWVzOiBbcHJvcHMuZG5zTmFtZV0sXG4gICAgICBjZXJ0aWZpY2F0ZTogcHJvcHMuY2VydGlmaWNhdGVcbiAgICB9KVxuICAgIGNsb3VkRnJvbnQuYXBwbHlSZW1vdmFsUG9saWN5KFJlbW92YWxQb2xpY3kuREVTVFJPWSk7XG5cbiAgICAvL0EgUmVjb3JkXG4gICAgY29uc3QgYVJlY29yZCA9IG5ldyBBUmVjb3JkKHRoaXMsICdQZXJzb25hbEFSZWNvcmQnLCB7XG4gICAgICB6b25lOiBwcm9wcy5ob3N0ZWRab25lLFxuICAgICAgdGFyZ2V0OiBSZWNvcmRUYXJnZXQuZnJvbUFsaWFzKG5ldyBDbG91ZEZyb250VGFyZ2V0KGNsb3VkRnJvbnQpKVxuICAgIH0pXG4gICAgYVJlY29yZC5hcHBseVJlbW92YWxQb2xpY3koUmVtb3ZhbFBvbGljeS5ERVNUUk9ZKTtcbiAgICBcbiAgICBcbiAgICAvL1dlYnNpdGUgaG9zdCBidWNrZXQgcGVybWlzc2lvblxuICAgIGNvbnN0IHdlYnNpdGVQZXJtaXNzaW9uID0gbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoKTtcbiAgICB3ZWJzaXRlUGVybWlzc2lvbi5hZGRSZXNvdXJjZXMod2Vic2l0ZUJ1Y2tldC5idWNrZXRBcm4pO1xuICAgIHdlYnNpdGVQZXJtaXNzaW9uLmFkZFByaW5jaXBhbHMobmV3IGlhbS5BbnlQcmluY2lwYWwoKSk7XG4gICAgd2Vic2l0ZVBlcm1pc3Npb24uYWRkQWN0aW9ucygnczM6TGlzdEJ1Y2tldCcpO1xuXG4gICAgY29uc3Qgd2Vic2l0ZUJ1Y2tldFBlcm1pc3Npb24gPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCgpO1xuICAgIHdlYnNpdGVCdWNrZXRQZXJtaXNzaW9uLmFkZFJlc291cmNlcyhgJHt3ZWJzaXRlQnVja2V0LmJ1Y2tldEFybn0vKmApO1xuICAgIHdlYnNpdGVCdWNrZXRQZXJtaXNzaW9uLmFkZEFjdGlvbnMoJ3MzOkdldE9iamVjdCcsICdzMzpQdXRPYmplY3QnKTtcbiAgICB3ZWJzaXRlQnVja2V0UGVybWlzc2lvbi5hZGRQcmluY2lwYWxzKG5ldyBpYW0uQW55UHJpbmNpcGFsKCkpO1xuXG5cbiAgICB3ZWJzaXRlQnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3kod2Vic2l0ZVBlcm1pc3Npb24pO1xuICAgIHdlYnNpdGVCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeSh3ZWJzaXRlQnVja2V0UGVybWlzc2lvbik7XG5cbiAgICAvL0RlcGxveSBmcm9udGVuZFxuICAgIG5ldyBCdWNrZXREZXBsb3ltZW50KHRoaXMsICdNeVdlYnNpdGVEZXBsb3ltZW50Jywge1xuICAgICAgc291cmNlczogW1NvdXJjZS5hc3NldChwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLi4nLCAnZnJvbnRlbmQnLCAnYnVpbGQnKSldLFxuICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IHdlYnNpdGVCdWNrZXQsXG4gICAgICBkaXN0cmlidXRpb246IGNsb3VkRnJvbnRcbiAgICB9KTtcblxuICAgIC8vTGFtYmRhIEZ1bmN0aW9uIEdldCBQaG90byBcbiAgICBjb25zdCBnZXRQaG90b0xhbWJkYSA9IG5ldyBsYW1iZGEuTm9kZWpzRnVuY3Rpb24odGhpcywgJ0dldFBob3RvTGFtYmRhJywge1xuICAgICAgcnVudGltZTogUnVudGltZS5OT0RFSlNfMTJfWCxcbiAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnYXBpJywgJ2dldC1waG90bycsICdpbmRleC50cycpLFxuICAgICAgaGFuZGxlcjogJ2dldFBob3RvJyxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIFBIT1RPX0JVQ0tFVF9OQU1FOiBidWNrZXQuYnVja2V0TmFtZVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgZ2V0UGhvdG9Db250YWluZXJQZXJtaXNzaW9uID0gbmV3IGlhbS5Qb2xpY3lTdGF0ZW1lbnQoKTtcbiAgICBnZXRQaG90b0NvbnRhaW5lclBlcm1pc3Npb24uYWRkUmVzb3VyY2VzKGJ1Y2tldC5idWNrZXRBcm4pO1xuICAgIGdldFBob3RvQ29udGFpbmVyUGVybWlzc2lvbi5hZGRBY3Rpb25zKCdzMzpMaXN0QnVja2V0Jyk7XG5cbiAgICBjb25zdCBidWNrZXRHZXRQaG90b1Blcm1pc3Npb24gPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCgpO1xuICAgIGJ1Y2tldEdldFBob3RvUGVybWlzc2lvbi5hZGRSZXNvdXJjZXMoYCR7YnVja2V0LmJ1Y2tldEFybn0vKmApO1xuICAgIGJ1Y2tldEdldFBob3RvUGVybWlzc2lvbi5hZGRBY3Rpb25zKCdzMzpHZXRPYmplY3QnLCAnczM6UHV0T2JqZWN0Jyk7XG5cbiAgICBnZXRQaG90b0xhbWJkYS5hZGRUb1JvbGVQb2xpY3koZ2V0UGhvdG9Db250YWluZXJQZXJtaXNzaW9uKTtcbiAgICBnZXRQaG90b0xhbWJkYS5hZGRUb1JvbGVQb2xpY3koYnVja2V0R2V0UGhvdG9QZXJtaXNzaW9uKTtcblxuICAgIC8vTGFtYmRhIEZ1bmN0aW9uIEdldCBBbGwgUGhvdG9zXG4gICAgY29uc3QgZ2V0UGhvdG9zTGFtYmRhID0gbmV3IGxhbWJkYS5Ob2RlanNGdW5jdGlvbih0aGlzLCAnTXlTaW1wbGVBcHBMYW1iZGEnLCB7XG4gICAgICBydW50aW1lOiBSdW50aW1lLk5PREVKU18xMl9YLFxuICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLicsICdhcGknLCAnZ2V0LXBob3RvcycsICdpbmRleC50cycpLFxuICAgICAgaGFuZGxlcjogJ2dldFBob3RvcycsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBQSE9UT19CVUNLRVRfTkFNRTogYnVja2V0LmJ1Y2tldE5hbWVcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnN0IGJ1Y2tldENvbnRhaW5lclBlcm1pc3Npb24gPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCgpO1xuICAgIGJ1Y2tldENvbnRhaW5lclBlcm1pc3Npb24uYWRkUmVzb3VyY2VzKGJ1Y2tldC5idWNrZXRBcm4pO1xuICAgIGJ1Y2tldENvbnRhaW5lclBlcm1pc3Npb24uYWRkQWN0aW9ucygnczM6TGlzdEJ1Y2tldCcpO1xuXG4gICAgY29uc3QgYnVja2V0UGVybWlzc2lvbiA9IG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KCk7XG4gICAgYnVja2V0UGVybWlzc2lvbi5hZGRSZXNvdXJjZXMoYCR7YnVja2V0LmJ1Y2tldEFybn0vKmApO1xuICAgIGJ1Y2tldFBlcm1pc3Npb24uYWRkQWN0aW9ucygnczM6R2V0T2JqZWN0JywgJ3MzOlB1dE9iamVjdCcpO1xuXG4gICAgZ2V0UGhvdG9zTGFtYmRhLmFkZFRvUm9sZVBvbGljeShidWNrZXRDb250YWluZXJQZXJtaXNzaW9uKTtcbiAgICBnZXRQaG90b3NMYW1iZGEuYWRkVG9Sb2xlUG9saWN5KGJ1Y2tldFBlcm1pc3Npb24pO1xuXG4gICAgLy9TZXQgdXAgQXBpIEdhdGV3YXlcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdQZXJzb25hbC1hcGktZ3cnLCB7XG4gICAgICByZXN0QXBpTmFtZTogJ3Bob3RvLWFwaScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1BlcnNvbmFsIEFwaSBHYXRld2F5JyxcbiAgICAgXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6e1xuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAnWC1BbXotRGF0ZScsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICBdLFxuICAgICAgICBhbGxvd09yaWdpbnM6IFsnKiddLFxuICAgICAgICBhbGxvd01ldGhvZHM6IFsnT1BUSU9OUycsICdHRVQnLCAnUE9TVCcsICdQVVQnLCAnUEFUQ0gnLCAnREVMRVRFJ10sXG4gICAgICB9LFxuICAgICAgXG4gICAgfSk7XG4gICAgXG4gICAgYXBpLmFwcGx5UmVtb3ZhbFBvbGljeShSZW1vdmFsUG9saWN5LkRFU1RST1kpO1xuXG4gICAgZ2V0UGhvdG9zTGFtYmRhLmFwcGx5UmVtb3ZhbFBvbGljeShSZW1vdmFsUG9saWN5LkRFU1RST1kpO1xuICAgIGdldFBob3RvTGFtYmRhLmFwcGx5UmVtb3ZhbFBvbGljeShSZW1vdmFsUG9saWN5LkRFU1RST1kpO1xuXG4gICAgLy9JbnRlZ3JhdGUgbGFtYmRhIHdpdGggQVBJR2F0ZXdheSBHZXRQaG90b3NcbiAgICBjb25zdCBnZXRQaG90b3MgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnZ2V0UGhvdG9zJyk7XG4gICAgZ2V0UGhvdG9zLmFkZE1ldGhvZCgnR0VUJywgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZ2V0UGhvdG9zTGFtYmRhKSk7XG5cbiAgICAvL0ludGVncmF0ZSBsYW1iZGEgd2l0aCBBUElHYXRld2F5IGdldFBob3RvXG4gICAgY29uc3QgZ2V0UGhvdG8gPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgnZ2V0UGhvdG8nKTtcbiAgICBnZXRQaG90by5hZGRNZXRob2QoJ0dFVCcsIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGdldFBob3RvTGFtYmRhKSk7XG5cbiAgICAvL291dCBwdXQgOiBQaG90byBEZXBsb3llZCBCdWNrZXQgTmFtZVxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ015UzNCdWNrZXROYW1lRXhwb3J0Jywge1xuICAgICAgdmFsdWU6IGJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgZXhwb3J0TmFtZTogYE15UzNCdWNrZXROYW1lYFxuICAgIH0pO1xuXG4gICAgLy9vdXQgcHV0IDogV2Vic2l0ZSBCdWNrZXQgTmFtZVxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ015QXBwV2Vic2l0ZUJ1Y2tldE5hbWVFeHBvcnQnLCB7XG4gICAgICB2YWx1ZTogd2Vic2l0ZUJ1Y2tldC5idWNrZXROYW1lLFxuICAgICAgZXhwb3J0TmFtZTogYE15QXBwV2Vic2l0ZUJ1Y2tldE5hbWVgXG4gICAgfSk7XG4gICAgXG4gICAgLy9vdXQgcHV0IDogV2Vic2l0ZSBVUkxcbiAgICBuZXcgQ2ZuT3V0cHV0KHRoaXMsICdNeVdlYnNpdGVVcmwnLCB7XG4gICAgICB2YWx1ZTogY2xvdWRGcm9udC5kaXN0cmlidXRpb25Eb21haW5OYW1lLFxuICAgICAgZXhwb3J0TmFtZTogYE15QXBwV2Vic2l0ZVVybGBcbiAgICB9KTtcbiAgICAgIFxuICAgIC8vb3V0IHB1dCA6IEJ1Y2tldCBXZWJzaXRlIFVSTFxuICAgIG5ldyBDZm5PdXRwdXQodGhpcywgJ015QXBwV2Vic2l0ZUJ1Y2tldFVybEV4cG9ydCcsIHtcbiAgICAgIHZhbHVlOiB3ZWJzaXRlQnVja2V0LmJ1Y2tldFdlYnNpdGVVcmwsXG4gICAgICBleHBvcnROYW1lOiBgTXlBcHBXZWJzaXRlQnVja2V0VXJsRXhwb3J0YFxuICAgIH0pO1xuICB9XG59XG4iXX0=