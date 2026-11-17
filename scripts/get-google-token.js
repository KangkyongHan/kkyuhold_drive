const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

const envPath = path.join(__dirname, '..', '.env');

// .env 파싱 유틸
function readEnv() {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value.trim();
    }
  });
  return env;
}

function updateEnv(key, value) {
  let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  fs.writeFileSync(envPath, content, 'utf8');
}

async function main() {
  const env = readEnv();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log('==================================================');
  console.log('🌸 커플 드라이브 - Google Drive 연동 토큰 발급기');
  console.log('==================================================\n');

  let clientId = env.GOOGLE_CLIENT_ID;
  let clientSecret = env.GOOGLE_CLIENT_SECRET;

  if (!clientId) {
    clientId = await question('1. Google Client ID를 입력하세요: ');
    updateEnv('GOOGLE_CLIENT_ID', clientId.trim());
  } else {
    console.log(`✓ 기존 Client ID 사용: ${clientId.substring(0, 15)}...`);
  }

  if (!clientSecret) {
    clientSecret = await question('2. Google Client Secret을 입력하세요: ');
    updateEnv('GOOGLE_CLIENT_SECRET', clientSecret.trim());
  } else {
    console.log(`✓ 기존 Client Secret 사용: ${clientSecret.substring(0, 6)}...`);
  }

  const PORT = 3000;
  const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

  const oauth2Client = new google.auth.OAuth2(clientId.trim(), clientSecret.trim(), REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive',
    ],
  });

  console.log('\n--------------------------------------------------');
  console.log('👉 아래 주소를 브라우저에 복사하여 붙여넣고 구글 계정으로 로그인해 주세요:');
  console.log('--------------------------------------------------\n');
  console.log(authUrl);
  console.log('\n--------------------------------------------------');
  console.log(`승인 대기 중... (http://localhost:${PORT}/oauth2callback 대기중)\n`);

  // 임시 웹서버 구동하여 콜백 수신
  const server = http.createServer(async (req, res) => {
    try {
      const parsedUrl = url.parse(req.url, true);
      if (parsedUrl.pathname === '/oauth2callback') {
        const code = parsedUrl.query.code;
        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>오류: 인증 코드를 받지 못했습니다.</h1>');
          return;
        }

        const { tokens } = await oauth2Client.getToken(code);
        const refreshToken = tokens.refresh_token;

        if (refreshToken) {
          updateEnv('GOOGLE_REFRESH_TOKEN', refreshToken);
          console.log('\n🎉 [성공] Refresh Token 발급 완료 및 .env 자동 저장!');
          console.log(`GOOGLE_REFRESH_TOKEN=${refreshToken}\n`);

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #4CAF50;">🎉 인증 성공!</h1>
              <p>구글 드라이브 연동 토큰이 발급되어 <code>.env</code> 파일에 자동 저장되었습니다.</p>
              <p>이 창을 닫고 터미널로 돌아가셔도 좋습니다.</p>
            </div>
          `);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #ff9800;">주의</h1>
              <p>이미 한 번 인증되어 Refresh Token이 재발급되지 않았습니다. Google 계정 설정에서 앱 접근 권한을 삭제 후 재시도해주세요.</p>
            </div>
          `);
        }

        server.close(() => {
          rl.close();
          process.exit(0);
        });
      }
    } catch (err) {
      console.error('토큰 발급 실패:', err);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>오류 발생</h1><pre>${err.message}</pre>`);
      server.close(() => {
        rl.close();
        process.exit(1);
      });
    }
  });

  server.listen(PORT);
}

main().catch(console.error);

