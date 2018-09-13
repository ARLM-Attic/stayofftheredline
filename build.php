<?php

// php hack to build the game zip
$index = file_get_contents("dev.html");


$searchString = 'src="js/';
$pos = strpos($index, $searchString);

$source = "";

while($pos !== false) {
  $pos += strlen($searchString);

  $endPos = strpos($index, '"', $pos);
  $pos -= 3;
  $filepath = substr($index, $pos, $endPos - $pos);
  $qpos = strpos($filepath, "?");
  if($qpos !== false) {
    $filepath = substr($filepath, 0, $qpos);
  }
  print $filepath . "\n";

  if(file_exists($filepath)) {
    $source .= file_get_contents($filepath) . "\n\n";

  } else {
    print "FILE NOT FOUND $filepath";
    exit();
  }
  $pos = strpos($index, $searchString, $pos);
}

$fp = fopen("build/main.js", "w");
fwrite($fp, $source);
fclose($fp);

$cmd = "uglifyjs build/main.js --compress --mangle  --toplevel --output build/main.min.js";
exec($cmd);

unlink('build/main.js');

if(file_exists('build.zip')) {
  unlink('build.zip');
}

$cmd = "zip -r build.zip build sprites.png index.html";
exec($cmd);

