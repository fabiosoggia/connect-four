<?php

$input = file_get_contents('php://input');

$file = 'data';

$fh = fopen($file, 'a');
fclose($fh);

$current = file_get_contents($file);
if (!empty($input)) {
	if (!empty($current)) {
		$current .= ",";
	}
	$current .= $input;
	file_put_contents($file, $current);
}

echo "[$current]";