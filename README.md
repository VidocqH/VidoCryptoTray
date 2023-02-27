# VidoCryptoTray

Mac Tray for displaying the price and percentage of Crypto Coin over last 24 hours.

Tray updates per second. Ticker table updates per 5 seconds by default(Can change later).

Data collects from [Binance](https://www.binance.com/)

<img width="412" alt="image" src="https://user-images.githubusercontent.com/16725418/221626979-3819faa1-861d-43d2-b2be-c1f2ae7b08cc.png">
<img width="412" alt="image" src="https://user-images.githubusercontent.com/16725418/221627261-312f3290-9da5-4ac5-a2f4-3bbeaa313f30.png">

## Usage
+ Click the symbol to display it in Tray
+ Input a symbol and click the `Add` button or `Enter` key to add it into Ticker Table
+ Right click the symbol to delete it from Ticker Table
+ There are some settings can be changed in `Settings` page

## Contribute

### Dev Guide
```bash
git clone https://github.com/VidocqH/VidoCryptoTray.git
cd VidoCryptoTray
yarn install
yarn dev
```
Then there you go!

### Build
```bash
yarn run make
```
The executable will be in `./out`
