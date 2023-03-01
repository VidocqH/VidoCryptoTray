#!/bin/bash

# Check if icons installed
directory="./node_modules/cryptocurrency-icons"
if [ ! -d "$directory" ]; then
    echo "Directory $directory does not exist, please run 'yarn install' first"
    exit 1
fi

# Check if imagemagick installed
if ! command -v convert &> /dev/null; then
    echo "imagemagick could not be found, please install it first"
    exit
fi

# If coinIcons directory exists, remove it
if [ -d "./assets/coinIcons" ]; then
    echo "Removing old coinIcons directory"
    rm -rf coinIcons
fi

# Copy images from node_packages to assets
echo "Copying images from node_modules to assets"
cp -R node_modules/cryptocurrency-icons/32/white assets/32
cp -R node_modules/cryptocurrency-icons/32@2x/white assets/32@2x
echo "Done copying images"

echo "Handling images"
# Resize images in 32 directory and move to new directory
mkdir -p assets/coinIcons
for file in assets/32/*.png; do
    filename=$(basename "$file")
    convert "$file" -resize 16x16 "assets/coinIcons/${filename/./Template.}"
done
# Resize images in 32@2x directory and move to new directory
for file in assets/32@2x/*.png; do
    filename=$(basename "$file" .png)
    convert "$file" -resize 32x32 "assets/coinIcons/${filename/./Template.}@2x.png"
done
echo "Done handling images"

# Remove temp directories
echo "Removing temp directories"
rm -r assets/32
rm -r assets/32@2x

echo "Done!"
