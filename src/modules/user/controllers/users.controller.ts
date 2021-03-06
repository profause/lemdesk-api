import { Body, Controller, Get, Header, HttpCode, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { map, Observable, of, switchMap } from 'rxjs';
import { AuthTokenGuard } from 'src/modules/shared/guards/auth-token.guard';
import { ApiResponse, ResponseCodes } from 'src/modules/shared/models/api-response';
import { User } from '../models/user.entity';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Controller('user')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);
    constructor(public userService: UserService,
        public authService: AuthService) {
    }
    @Post('login')
    @Header('Cache-Control', 'none')
    login(@Body() data: any): Observable<ApiResponse> {
        let response = new ApiResponse();
        let authType = data.authType;
        const username = data.username;
        const password = data.password;
        if (authType == 'USERNAME_AND_PASSWORD') {
            const loginResult$ = this.authService.loginWithUsernameAndPassword(username, password);

            return loginResult$.pipe(map((loginResult: any) => {
                if (loginResult) {
                    response.code = ResponseCodes.SUCCESS.code;
                    response.message = ResponseCodes.SUCCESS.message;
                    response.data = {
                        ...loginResult,
                    }
                } else {
                    response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
                    response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
                }
                return response;
            }))
        }

        // response.data = authType;
        // return of(response);
    }

    @Post('create')
    @Header('Cache-Control', 'none')
    create(@Body() user: User): Observable<ApiResponse> {
        let response = new ApiResponse();
        const createdUserResult$ = this.userService.create(user);
        return createdUserResult$.pipe(map((createdUser: User) => {
            response.code = ResponseCodes.SUCCESS.code;
            response.message = ResponseCodes.SUCCESS.message;
            response.data = { ...createdUser };
            return response;
        }));
    }

    @Get()
    @Header('Cache-Control', 'none')
    findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Observable<ApiResponse> {
        let response = new ApiResponse();

        return this.userService.findAll({ page, limit }).pipe(map((usersPagable) => {
            const userItems = usersPagable.items;
            const userItemsMeta = usersPagable.meta;
            if (userItems.length > 0) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = userItems;
                response.meta = userItemsMeta;
            } else {
                response.code = ResponseCodes.NO_RECORD_FOUND.code;
                response.message = ResponseCodes.NO_RECORD_FOUND.message;
            }
            return response;
        }));
    }

    @Post('refreshtoken')
    @Header('Cache-Control', 'none')
    refreshToken(@Body() data: any): Observable<ApiResponse> {
        let response = new ApiResponse();
        const id = data.id;
        const refreshTokenResult$ = this.authService.refreshToken(id);
        return refreshTokenResult$.pipe(map((loginResult: any) => {
            if (loginResult) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = {
                    token: loginResult,
                }
            } else {
                response.code = ResponseCodes.AUTHENTICATION_FAILED.code;
                response.message = ResponseCodes.AUTHENTICATION_FAILED.message;
            }
            return response;
        }))
    }

    @UseGuards(AuthTokenGuard)
    @Get(':userId')
    @Header('Cache-Control', 'none')
    findOne(@Param('userId') userId: string): Observable<ApiResponse> {
        let response = new ApiResponse();
        return this.userService.findOne(userId).pipe(map((user) => {
            if (user.hasId) {
                response.code = ResponseCodes.SUCCESS.code;
                response.message = ResponseCodes.SUCCESS.message;
                response.data = user
            } else {
                response.code = ResponseCodes.NO_RECORD_FOUND.code;
                response.message = ResponseCodes.NO_RECORD_FOUND.message;
            }
            return response;
        }));
    }

    

    

    @UseGuards(AuthTokenGuard)
    @Post('validatetoken')
    @Header('Cache-Control', 'none')
    @HttpCode(200)
    validateToken(@Body() user: User): Observable<ApiResponse> {
        let response = new ApiResponse();
        response.code = ResponseCodes.SUCCESS.code;
        response.message = ResponseCodes.SUCCESS.message;
        return of(response);
    }

   
}
