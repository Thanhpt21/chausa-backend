export class UserResponseDto {
  id: number;
  name: string;
  email: string;
 phoneNumber: number | null; // <-- Có thể là null
  profilePicture: string | null; // <-- Có thể là null
  gender: string | null; // <-- Có thể là null
  role: string;
  type_account: string;
  isActive: boolean;

  // Không bao gồm password
    constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.type_account = user.type_account;
    this.phoneNumber = user.phoneNumber || null;
    this.profilePicture = user.profilePicture || null;
    this.gender = user.gender || null;
    this.isActive = user.isActive;
    }
}
