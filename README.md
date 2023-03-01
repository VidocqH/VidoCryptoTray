# VidoCryptoTray

Mac Tray for displaying the price and percentage of Crypto Coins over last 24 hours.

Tray updates per second. Ticker table updates per 5 seconds by default(Can change later).

Data collects from [Binance](https://www.binance.com/)

## Screenshot
<img width="416" alt="image" src="https://user-images.githubusercontent.com/16725418/221704572-07f825e5-db44-41c0-9d72-601fa4b02d28.png">
<img width="412" alt="image" src="https://user-images.githubusercontent.com/16725418/221704370-5deb7ec6-55e1-40e5-92da-b16e11a29ff8.png">
<img width="415" alt="image" src="https://user-images.githubusercontent.com/16725418/221704971-ca428159-42fe-400f-b09f-8b66a6a82153.png">

## Usage

+ Select the symbol to display it in Tray
+ Unselect the symbol to not display it in Tray
+ Input a symbol and click the `Add` button or `Enter` key to add it into Ticker Table
+ Right click the symbol to delete it from Ticker Table
+ Settings can be changed in `Settings` page

## Contribute

### Dev Guide

```bash
git clone https://github.com/VidocqH/VidoCryptoTray.git
cd VidoCryptoTray
yarn install
chmod +x generateIcons.sh
./generateIcons.sh
yarn dev
```

Then there you go!

### Build

```bash
yarn run make
```

The executable will be in `./out`
