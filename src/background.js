import * as tf from '@tensorflow/tfjs';
import { IMAGENET_CLASSES } from './imagenet_classes';

const IMAGE_SIZE = 224;
const TOPK_PREDICTIONS = 10;
console.log('TensorFlow imported successfully:', tf.version.tfjs);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'classifyImage') {
    classifyImage(message.imageUrl, sendResponse);
    return true; // Indicates that sendResponse will be called asynchronously
  }
});

async function getTopKClasses(logits, topK) {
  const values = await logits.data();
  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({value: values[i], index: i});
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });
  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: IMAGENET_CLASSES[topkIndices[i]],
      probability: topkValues[i]
    })
  }
  return topClassesAndProbs;
}


async function classifyImage(imageUrl, callback) {
  try {
    const model = await tf.loadModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    const image = await loadImage(imageUrl);
    const logits = tf.tidy(() => {
      const img = tf.fromPixels(image).toFloat();
      const offset = tf.scalar(127.5);
      const normalized = img.sub(offset).div(offset);
      const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
      return model.predict(batched);
    });
    // const predictions = model.predict(image);
    const predictions = await getTopKClasses(logits, TOPK_PREDICTIONS);

    // console.log(predictions);
    
    // Extracting top classes
    // const topClasses = await getTopClasses(predictions);

    // callback(topClasses);
    console.log(predictions);
    callback(predictions)
  } catch (error) {
    console.error('Error classifying image:', error);
    callback([]);
  }
}

async function loadImage(src) {
  return new Promise(resolve => {
    var img = document.createElement('img');
    img.crossOrigin = "anonymous";
    img.onerror = function(e) {
      resolve(null);
    };
    img.onload = function(e) {
      if ((img.height && img.height > 128) || (img.width && img.width > 128)) {
        // Set image size for tf!
        img.width = IMAGE_SIZE;
        img.height = IMAGE_SIZE;
        resolve(img);
      }
      // Let's skip all tiny images
      resolve(null);
    }
    img.src = src;
  });
}

// async function loadImage(imageUrl) {
//   const response = await fetch(imageUrl);
//   const blob = await response.blob();
//   console.log(blob);
//   console.log('TensorFlow inside imported successfully:', tf.browser);
//   const image = await tf.browser.fromPixels(blob);
//   return image;
// }

async function getTopClasses(predictions, numClasses = 3) {
  const topClassesIndices = Array.from(await predictions.topk(numClasses).indices.data());
  return topClassesIndices.map(index => `Class ${index}`);
}
