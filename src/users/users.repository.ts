import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  findOneByFilter(filter: any) {
    const user = this.userRepository.findOne({ where: filter });

    return user;
  }

  createOrUpdateUser(user: User) {
    this.userRepository.upsert(user, ['email']);
  }

  verifyUser(email: string) {
    this.userRepository.update({ email: email }, { isVerified: true });
  }

  async updatePassword(userId: number, newPassword: string): Promise<User> {
    const user = await this.userRepository.update(
      { id: userId },
      { password: newPassword },
    );

    return user[0];
  }
}
