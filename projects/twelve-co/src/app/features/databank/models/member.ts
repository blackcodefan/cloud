import { RoleEnum } from 'core-lib';

export interface Member {
    id: number;
    firstName: string;
    lastName: string;
    accountName: string;
    avatar: string;
}

export interface RemoveMemberDto {
    storageId: string;
    targetAccountId?: number;
    membershipId: number;
}

export interface ChangePermission {
    storageId: string;
    targetAccount: number;
    newRole: RoleEnum;
}

export interface ChangeExpirationDto {
    targetAccountId: number;
    targetStorageId: string;
    expirationDate: Date;
}
