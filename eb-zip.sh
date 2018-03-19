set -e
export APP_NAME='Spectiv-vr-platform'
export APP_VERSION=`git rev-parse --short HEAD`



echo ""
echo ""
echo "==========================="
echo "| cleaning git repository |"
echo "==========================="
echo ""
# clean build artifacts and create the application archive (also ignore any files named .git* in any folder)
git clean -fd

# precompile assets, ...
echo ""
echo ""
echo "==========================="
echo "| compiling sass          |"
echo "==========================="
echo ""
npm run sass

echo ""
echo ""
echo "==========================="
echo "| running build           |"
echo "==========================="
echo ""
npm run build

echo ""
echo ""
echo "==========================="
echo "| running webpack         |"
echo "==========================="
echo ""
./node_modules/.bin/webpack -p --config ./webpack.production.config.js


echo ""
echo ""
echo "==========================="
echo "| creating zip for AWS    |"
echo "==========================="
echo ""
zip -x *.git* -x "node_modules/**" -x ".env" -r "../${APP_NAME}-${APP_VERSION}.zip" .
#echo "${APP_NAME}-${APP_VERSION}.zip" .
