import {
  Body,
  Controller,
  Get, Logger, Param, Post,
  Put,
  Req, Response,
  StreamableFile,
  UploadedFile, UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDto } from 'src/users/users.dtos';
import { UsersService } from 'src/users/users.service';
import { Readable } from 'stream';

import { DatabaseFilesService } from './databaseFiles.service';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly userService: UsersService,
              private readonly databaseFilesService: DatabaseFilesService) {};

  @Get()
  getUsers() {
    this.logger.log('getting users\n');
    return this.userService.getUsers();
  }

  @Get('user')
  findUsersById(@Req() req: any) {
    return this.userService.findUsersById(req.session.userId)
    //.then((user) => user ? user : {} );
  }

  @Post('create')
  @UsePipes(ValidationPipe)
  createUser(@Body() body: UserDto) {
    this.logger.log('Creating user...')
    return this.userService.createUser(body);
  }

  @Put('signupuser')
  @UsePipes(ValidationPipe)
  signUpUser(@Req() req: any, @Body() body: UserDto) {
    return this.userService.signUpUser(req.session.userId, body.username);
  }

  @Put('updateuser')
  @UsePipes(ValidationPipe)
  updateUser(@Req() req: any, @Body() body: UserDto) {
    return this.userService.updateUser(req.session.userId, body.username, body.isTfaEnabled);
  }

  @Put('signoutuser')
  @UsePipes(ValidationPipe)
  signOutUser(@Req() req: any) {
    return this.userService.signOutUser(req.session.userId);
  }

  @Post('setusername')
  @UsePipes(ValidationPipe)
  setUsername(@Req() req: any, username: string) {
    this.logger.log("setUsername called");
    return this.userService.setUsername(req.session.userId, username);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    this.logger.log("id: ", req.session.userId);
    this.logger.log("filename: ", file.originalname);
    return this.userService.addAvatar(req.session.userId, file.buffer,
                                      file.originalname);
  }

  @Get('avatar')
  async getDatabaseFileById(@Req() req: any, @Response({passthrough : true})
                                             res): Promise<StreamableFile> {
    const userId = req.session.userId;
    const avatarId = await this.userService.getAvatarId(userId);
    if (avatarId === null)
      return null;
    const file = await this.databaseFilesService.getFileById(avatarId);
    const stream = Readable.from(file.data);
    res.set({
      'Content-Type' : 'image',
      'Content-Disposition' : `inline;// filename="${file.filename}"`,
    });
    return new StreamableFile(stream);
  }


  // Endpoint needed for chat

  @Get('id/:id')
  findUser(@Param('id') id: number) {                 //need this endpoint to get owner name of a channel
    return this.userService.findUsersById(Number(id));
  }

  @Put('block/:id')
  blockUser(@Param('id') blocked: number, @Req() req: any) {
    const blocker = req.session.userId;  
    console.log("Blocking", blocker, blocked)             
    return this.userService.blockUser(Number(blocker), Number(blocked));
  }

  @Put('unblock/:id')
  unblockUser(@Param('id') blocked: number, @Req() req: any) {
    const blocker = req.session.userId;  
    console.log("UNblocking", blocker, blocked)             
    return this.userService.unblockUser(Number(blocker), Number(blocked));
  }

  @Get('is-blocked/:id')
  isBlocked(@Param('id') id: number, @Req() req: any) {
    const blocker = req.session.userId;        
    return this.userService.isBlocked(Number(blocker), Number(id));
  }


  @Put('friend/:id')
  friendUser(@Param('id') friend: number, @Req() req: any) {
    const userID = req.session.userId;  
    console.log("Befriending", userID, friend)             
    return this.userService.friendUser(Number(userID), Number(friend));
  }

  @Put('unfriend/:id')
  unfriendUser(@Param('id') friend: number, @Req() req: any) {
    const userID = req.session.userId;  
    console.log("UNfriending", userID, friend)             
    return this.userService.unfriendUser(Number(userID), Number(friend));
  }

  @Get('is-friend/:id')
  isFriend(@Param('id') id: number, @Req() req: any) {
    const userID = req.session.userId;        
    return this.userService.isFriend(Number(userID), Number(id));
  }
}
