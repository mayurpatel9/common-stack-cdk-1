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
exports.DeployS3WithPhoto = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_s3_deployment_1 = require("aws-cdk-lib/aws-s3-deployment");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const path = __importStar(require("path"));
class DeployS3WithPhoto extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        this.bucket = new aws_s3_1.Bucket(this, 'MyS3Bucket', {
            encryption: props.encryption,
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });
        //Bucket deployment
        new aws_s3_deployment_1.BucketDeployment(this, 'MyS3BucketApp', {
            sources: [
                aws_s3_deployment_1.Source.asset(path.join(__dirname, ...props.deployTo))
            ],
            destinationBucket: this.bucket
        });
    }
}
exports.DeployS3WithPhoto = DeployS3WithPhoto;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwbG95LXMzLXdpdGgtcGhvdG9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGVwbG95LXMzLXdpdGgtcGhvdG9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2Q0FBK0Q7QUFFL0QscUVBQXlFO0FBQ3pFLCtDQUF1RTtBQUN2RSwyQ0FBNkI7QUFPN0IsTUFBYSxpQkFBa0IsU0FBUSxtQkFBSztJQUl4QyxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQTZCO1FBQ25FLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsSUFBSSxFQUFFLFlBQVksRUFBRTtZQUN6QyxVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVU7WUFDNUIsYUFBYSxFQUFFLDJCQUFhLENBQUMsT0FBTztZQUNwQyxpQkFBaUIsRUFBRSxJQUFJO1NBQzFCLENBQUMsQ0FBQztRQUVILG1CQUFtQjtRQUNuQixJQUFJLG9DQUFnQixDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDeEMsT0FBTyxFQUFFO2dCQUNMLDBCQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3hEO1lBQ0QsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLE1BQU07U0FDakMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBckJELDhDQXFCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN0YWNrLCBSZW1vdmFsUG9saWN5LCBTdGFja1Byb3BzIH0gZnJvbSAnYXdzLWNkay1saWInO1xyXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcclxuaW1wb3J0IHsgQnVja2V0RGVwbG95bWVudCwgU291cmNlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnQnO1xyXG5pbXBvcnQgeyBCdWNrZXQsIEJ1Y2tldEVuY3J5cHRpb24sIElCdWNrZXQgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xyXG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuaW50ZXJmYWNlIERlcGxveVMzV2l0aFBob3RvUHJvcHMgZXh0ZW5kcyBTdGFja1Byb3BzIHtcclxuICAgIGVuY3J5cHRpb246IEJ1Y2tldEVuY3J5cHRpb24sXHJcbiAgICBkZXBsb3lUbzogc3RyaW5nW11cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIERlcGxveVMzV2l0aFBob3RvIGV4dGVuZHMgU3RhY2sge1xyXG5cclxuICAgIHB1YmxpYyByZWFkb25seSBidWNrZXQ6IElCdWNrZXQ7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IERlcGxveVMzV2l0aFBob3RvUHJvcHMpIHtcclxuICAgICAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdNeVMzQnVja2V0Jywge1xyXG4gICAgICAgICAgICBlbmNyeXB0aW9uOiBwcm9wcy5lbmNyeXB0aW9uLFxyXG4gICAgICAgICAgICByZW1vdmFsUG9saWN5OiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXHJcbiAgICAgICAgICAgIGF1dG9EZWxldGVPYmplY3RzOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vQnVja2V0IGRlcGxveW1lbnRcclxuICAgICAgICBuZXcgQnVja2V0RGVwbG95bWVudCh0aGlzLCAnTXlTM0J1Y2tldEFwcCcsIHtcclxuICAgICAgICAgICAgc291cmNlczogW1xyXG4gICAgICAgICAgICAgICAgU291cmNlLmFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsIC4uLnByb3BzLmRlcGxveVRvKSlcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgZGVzdGluYXRpb25CdWNrZXQ6IHRoaXMuYnVja2V0XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iXX0=