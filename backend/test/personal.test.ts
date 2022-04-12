/*
import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Personal from '../lib/personal-stack';
import '@aws-cdk/assert/jest';
import { IPublicHostedZone } from '@aws-cdk/aws-route53';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';

test('App Stack', () => {
    const app = new cdk.App();
    // WHEN
  /*
    interface PersonalStackProps extends cdk.StackProps {
    dnsName: string,
    hostedZone: IPublicHostedZone,
    certificate: ICertificate
  }
  const stack = new Personal.PersonalStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {
        "MyS3Bucket4646DF6F": {
          "Type": "AWS::S3::Bucket",
          "Properties": {
            "BucketEncryption": {
              "ServerSideEncryptionConfiguration": [
                {
                  "ServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                  }
                }
              ]
            }
          },
          "UpdateReplacePolicy": "Retain",
          "DeletionPolicy": "Retain",
          
        },
        
      },
      "Outputs": {
        "MyS3BucketNameExport": {
          "Value": {
            "Ref": "MyS3Bucket4646DF6F"
          },
          "Export": {
            "Name": "MyS3BucketName"
          }
        }
      }
    }, MatchStyle.EXACT))
});


test('Stack Create S3 Bucket', () => {
  //ARRANGE
  const app = new cdk.App();
  // ACT
  const stack = new Personal.PersonalStack(app, 'MyTestStack');
    // ASSERT

    expect(stack).toHaveResource('AWS::S3::Bucket');

});

*/
