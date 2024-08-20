const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class TransactionsMains extends Model {};

TransactionsMains.init(
  {
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'customer_id',
      },
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    ordered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    timestamps: false,
    freezeTableName: true,
    underscored: true,
    modelName: 'transactionsmains',
  }
)

module.exports = TransactionsMains;