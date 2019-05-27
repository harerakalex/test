import fs from 'fs';
import Joi from 'joi';


// including files that contains our datas
const ordersDb = fs.readFileSync('models/orders.json', 'utf-8');
const parseDb = JSON.parse(ordersDb);

const carsDb = fs.readFileSync('models/cars.json', 'utf-8');
const carParseDb = JSON.parse(carsDb);

class Order {
/**
 *
 * @param {*} req
 * @param {*} res
 */
  async fetch(req, res) {
    const foundOwner = parseDb.find(c => c.id === parseInt(req.params.id, 36));
    if (!foundOwner) {
      res.status(404).json({
        status: 404,
        error: 'Could not find Car with a given ID',
      });
    }
    res.status(200).json({
      status: 200,
      data: foundOwner,
    });
  }

  /**
 *
 * @param {*} req
 * @param {*} res
 */
  async create(req, res) {
    const validateOrder = (car) => {
      const schema = {
        buyer: Joi.number().integer().required(),
        car_id: Joi.number().integer().required(),
        amount: Joi.number().precision(4).positive().min(2)
          .required(),
      };
      return Joi.validate(car, schema);
    };

    // Getting Actual time
    const today = new Date();
    const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    const DateTime = `${date} ${time}`;


    const { error } = validateOrder(req.body);
    if (error) {
      res.status(400).json({ status: 400, error: error.details[0].message });
    }
    // getting the price of specified car_id
    const carId = req.body.car_id;
    const foundCar = carParseDb.find(c => c.id === carId);
    if (!foundCar) return res.status(404).json({ status: 404, error: 'Could not find Car with a given ID' });
    const actualPrice = foundCar.price;
    const newOrder = {
      id: parseDb.length + 1,
      buyer: req.body.buyer,
      car_id: req.body.car_id,
      created_on: DateTime,
      price: actualPrice,
      price_offered: req.body.amount,
      status: 'pending',
    };

    parseDb.push(newOrder);
    const newInput = JSON.stringify(parseDb, null, 2);
    fs.writeFile('models/orders.json', newInput, (error) => {
      if (error) { throw new Error(); }
    });
    res.status(201).json({
      status: 201,
      data: newOrder,
    });
  }

  /**
 *
 * @param {*} req
 * @param {*} res
 */
  async update(req, res) {
    const foundOrder = parseDb.find(c => c.id === parseInt(req.params.id, 36) && c.status === 'pending');
    if (!foundOrder) return res.status(404).json({ status: 404, error: 'Could not find Car with a given ID' });
    if (!req.body.new_price_offered) return res.status(400).json({ status: 400, error: 'Please enter the price' });

    const old_price_offered = foundOrder.price_offered;
    const newPrice = req.body.new_price_offered;
    foundOrder.price_offered = newPrice;
    const updatePrice = JSON.stringify(parseDb, null, 2);
    fs.writeFile('models/orders.json', updatePrice, (error) => {
      if (error) { throw new Error(); }
    });
    foundOrder.new_price_offered = newPrice;
    foundOrder.old_price_offered = old_price_offered;
    delete foundOrder.price_offered;
    res.status(200).json({
      status: 200,
      data: foundOrder,
    });
  }

  /**
 *
 * @param {*} req
 * @param {*} res
 */
  async delete(req, res) {

  }
}

export default Order;
