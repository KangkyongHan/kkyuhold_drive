const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testDrive() {
  console.log('Testing Google Drive Connection...');
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.error('Missing credentials in .env');
    return;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000/oauth2callback'
  );

  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  // 1. Check folder
  const folderName = process.env.GOOGLE_DRIVE_FOLDER_NAME || 'Couple_Drive';
  const listRes = await drive.files.list({
    q: `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  let folderId;
  if (listRes.data.files && listRes.data.files.length > 0) {
    folderId = listRes.data.files[0].id;
    console.log(`✓ 기존 '${folderName}' 폴더 발견 (ID: ${folderId})`);
  } else {
    console.log(`'${folderName}' 폴더 생성 중...`);
    const createRes = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });
    folderId = createRes.data.id;
    console.log(`✓ '${folderName}' 폴더가 내 구글 드라이브에 성공적으로 생성되었습니다! (ID: ${folderId})`);
  }

  // 2. Test small upload
  console.log('테스트 파일 업로드 시도 중...');
  const testUpload = await drive.files.create({
    requestBody: {
      name: 'couple_drive_test.txt',
      parents: [folderId],
    },
    media: {
      mimeType: 'text/plain',
      body: 'Couple Drive Google Drive integration test success! ❤️',
    },
    fields: 'id, name, webViewLink',
  });

  console.log(`🎉 [대성공!] 파일 업로드 성공: ${testUpload.data.name} (ID: ${testUpload.data.id})`);
  console.log(`링크: ${testUpload.data.webViewLink}`);
}

testDrive().catch((err) => {
  console.error('❌ 테스트 실패:', err.message);
});
