# AWS KMS Setup Guide for DRM (Phase 1)

**Purpose:** We will store each “content key” (DEK) under AWS KMS.  
Later, at license time, our license server will call KMS to “Decrypt” (unwrap) the DEK so it can build a license.  

## 1. Create a Customer Master Key (CMK)

1. Sign in to the [AWS Console](https://console.aws.amazon.com).  
2. Navigate to **Services → Security, Identity, & Compliance → Key Management Service**.  
3. In the left sidebar, click **Customer managed keys**.  
4. Click **Create key**.  
   - **Type:** Symmetric  
   - **Key usage:** Encrypt and decrypt  
   - **Alias:** `alias/video-drm-master-key`  
   - **Description:** “Master key for encrypting video DEKs”  
5. **Key Administrators:** Add your IAM user or Admin group.  
6. **Key Usage Permissions:** Add the IAM role that your license server (Phase 2) will run under and grant it `kms:Decrypt` & `kms:DescribeKey`.  
7. Review → Create key.  
8. Copy the **Key ARN** (e.g. `arn:aws:kms:ap-southeast-2:598283243251:key/f039a8aa-06a9-4de4-b5b6-7846758fafb2`).  
   - Save that string in `docs/phase-1/kms-info.txt` or `kms-setup-guide.md`.

## 2. IAM Policy for License Server

We need a policy that allows decrypting only this CMK.  
Create a new policy in IAM with this JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowUseOfDRMKey",
      "Effect": "Allow",
      "Action": ["kms:Decrypt", "kms:DescribeKey", "kms:GenerateDataKey"],
      "Resource": "arn:aws:kms:us-east-1:123456789012:key/abcd1234-5678-90ab-cdef-EXAMPLEKEY"
    }
  ]
}
