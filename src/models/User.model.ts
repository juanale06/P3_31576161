import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

@Table({
  tableName: 'Users',
  timestamps: true,
})
class User extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nombreCompleto!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  // Método para comparar contraseñas
  public validPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.password);
  }

  @BeforeCreate
  static async hashPasswordBeforeCreate(user: User) {
    if (user.password && !user.password.startsWith('$2')) {
      user.password = bcrypt.hashSync(user.password, 10);
    }
  }

  @BeforeUpdate
  static async hashPasswordBeforeUpdate(user: User) {
    // Check if password field was changed
    const changedFields = user.changed() as string[] | boolean;
    if (changedFields && (changedFields === true || (Array.isArray(changedFields) && changedFields.includes('password')))) {
      if (user.password && !user.password.startsWith('$2')) {
        user.password = bcrypt.hashSync(user.password, 10);
      }
    }
  }
}

export default User;