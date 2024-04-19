import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { JwtAccountPayload } from 'common.interface';
import { Express } from 'express';
import { createWriteStream, readFileSync } from 'fs';
import { lstat, mkdir } from 'fs/promises';
import JWT, { Algorithm } from 'jsonwebtoken';
import path from 'path';
import { Stream } from 'stream';
import 'dotenv/config';

export class AuthLib {
  alg: Algorithm = 'RS256';

  async downloadImage(url: string, path: string) {
    try {
      await lstat(path);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        const dir = path.split('/').slice(0, -1).join('/');
        await mkdir(dir, {
          recursive: true,
        });
      }
    }
    const stream = await axios<Stream>({
      url,
      responseType: 'stream',
    });
    return new Promise((resolve, reject) => {
      stream.data
        .pipe(createWriteStream(path))
        .on('finish', () => resolve(true))
        .on('error', (e: any) => reject(e));
    });
  }

  async hashPassword(pwd: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pwd, salt);
  }

  async comparePassword(pwd: string, hash: string) {
    return await bcrypt.compare(pwd, hash);
  }

  getSecretKey() {
    return readFileSync(
      path.join(process.cwd(), 'keys', 'jwtPrivkey.pem'),
      'utf8'
    );
  }

  generateSessionToken(payload: JwtAccountPayload) {
    return JWT.sign(payload, this.getSecretKey(), {
      algorithm: this.alg,
      expiresIn: '30d',
    });
  }

  decodeSessionToken(token: string) {
    const verifiedJwt = JWT.verify(token, this.getSecretKey(), {
      complete: true,
      algorithms: [this.alg],
    });
    if (verifiedJwt instanceof Error) {
      throw verifiedJwt;
    }
    const payload = verifiedJwt.payload as JWT.JwtPayload &
      Express['request']['user'];
    return payload;
  }
}
