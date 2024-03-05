import { Controller, Post, UseGuards, Request, Get, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from "./local-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { UserService } from "src/user/user.service";
import { compare } from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Controller('test')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private jwtService: JwtService
	) {}
	 
	// @UseGuards(LocalAuthGuard)
	@Post('auth/login')
	async login(@Request() req) {
		const user = await this.userService.findByEmail(req.body.email.toLowerCase())
		if (user) {
			const isMatch = await compare(req.body.password, user.password)
			let res = null
			if (user && isMatch) {
				const { password, ...result } = user
				res = result
			} else {
				throw new UnauthorizedException()
			}
			const payload = { email: user.email, id: user.id }
			return {
				access_token: this.jwtService.sign(payload, { secret: "AZAT" })
			}
		} else {
			const user = await this.userService.findByPersonalCode(req.body.email.toUpperCase())
			const isMatch = await compare(req.body.password, user.password)
			let res = null
			if (user && isMatch) {
				const { password, ...result } = user
				res = result
			} else {
				throw new UnauthorizedException()
			}
			const payload = { email: user.email, id: user.id }
			return {
				access_token: this.jwtService.sign(payload, { secret: "AZAT" })
			}
		}
		
	}

	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}