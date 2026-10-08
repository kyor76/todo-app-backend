import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { User, UserSchema } from './user.schema.js';

@Module ({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({
            global: true,
            secret: 'KODE_RAHASIA',
            signOptions: { expiresIn: '1h' },
        }),
    
    ],
    controllers: [AuthController],
    providers: [AuthService],
})

export class AuthModule {}
