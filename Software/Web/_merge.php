<?php

function processCSSURLs($source, $basePath)
{
	preg_match_all("/url(\(((?:[^()]+|(?1))+)\))/m", $source, $matches, PREG_SET_ORDER);
	foreach ($matches as $match)
	{
		if (preg_match('/^([\'"]?)[^"]+\1$/', $match[2]))
		{
			$fileName = trim($match[2], "'\"");
			if (substr($fileName, 0, 5) != "data:")
			{
				if (file_exists($basePath.$fileName))
				{
					$source = str_replace($match[0], "url(data:".mime_content_type($fileName).";base64,".base64_encode(file_get_contents($basePath.$fileName)).")", $source);
				}
			}
			
		}
	}
	return $source;
}

function removeComments($code)
{
    $outCode= "";
    $code = str_replace("\r", "", $code);
    $codeArray = str_split($code);
    $inQ1 = false;
    $inQ2 = false;
    $inCLine = false;
    $inCLong = false;
    $lastChar = "";

    foreach ($codeArray as $char)
    {
        if (!$inCLine && !$inCLong)
        {
            if ($char == '"' && !$inQ2 && $lastChar != "\\")
            {
                $inQ1 = !$inQ1;
            }
            if ($char == "'" && !$inQ1 && $lastChar != "\\")
            {
                $inQ2 = !$inQ2;
            }

            if ($inQ1 || $inQ2)
            {
                $outCode .= $char;
            }
            else if ($char != " " || ($lastChar != " " && $lastChar != ":" && $lastChar != "{" && $lastChar != ";" && $lastChar != ")"))
            {
                $outCode .= $char;
            }
        }

        if (!$inQ1 && !$inQ2)
        {
            if ($inCLine)
            {
                if ($char == "\n")
                {
                    $inCLine = !$inCLine;
                }
            }
            else
            {
                if ($char == "/" && $lastChar == "/")
                {
                    $inCLine = !$inCLine;
                    $outCode = substr($outCode, 0, -2);
                }
            }


            if ($inCLong)
            {
                if ($char == "/" && $lastChar == "*")
                {
                    $inCLong = !$inCLong;
                }
            }
            else
            {
                if ($char == "*" && $lastChar == "/")
                {
                    $inCLong = !$inCLong;
                    $outCode = substr($outCode, 0, -2);
                }
            }
        }

        $lastChar = $char;
    }
    return $outCode;
}

//$fileN = 0;

function compactJS($code)
{
	//global $fileN;
    $code = removeComments($code);

	//$fileN++;
	//file_put_contents("./_temp".$fileN.".js", $code);

    $outCode= "";
    $code = str_replace("\n", " ", $code);
    $codeArray = str_split($code);
    $inQ1 = false;
    $inQ2 = false;
    $lastChar = "\0";
    $lastPrintedChar = "\0";
    
    foreach ($codeArray as $char)
    {
        if ($char == '"' && !$inQ2 && $lastChar != "\\")
        {
            $inQ1 = !$inQ1;
        }
        if ($char == "'" && !$inQ1 && $lastChar != "\\")
        {
            $inQ2 = !$inQ2;
        }

        if (!$inQ1 && !$inQ2)
        {
            if ($char == "\t")
            {
                $char = " ";
            }
        }

        if ($inQ1 || $inQ2)
        {
            $outCode .= $char;
			//echo $char;
        }
        else if ($char != " " || (strpos(" +-/*{}=,;\"'()![]&|:.<>", $lastChar) === FALSE))
        {
            if (strpos("+-/*{}=,;[]()!|&:.<>", $char) !== FALSE && $lastPrintedChar == " ")
            {
                $outCode = substr($outCode, 0, -1);
            }
			//echo $char;
            $outCode .= $char;
            $lastPrintedChar = $char;
        }

        $lastChar = $char;
    }
	//echo $outCode;
    return $outCode;
}

function compactCSS($style, $basePath = "")
{
    $outStyle = "";
    $style = str_replace("\r", " ", $style);
    $style = str_replace("\n", " ", $style);
    $style = str_replace("\t", " ", $style);
    $styleArray = str_split($style);
    $inQ1 = false;
    $inQ2 = false;
    $lastChar = "";
    
    foreach ($styleArray as $char)
    {
        if ($char == '"' && !$inQ2)
        {
            $inQ1 = !$inQ1;
        }
        if ($char == "'" && !$inQ1)
        {
            $inQ2 = !$inQ2;
        }

        if ($inQ1 || $inQ2)
        {
            $outStyle .= $char;
        }
        else if ($char != " " || ($lastChar != " " && $lastChar != ":" && $lastChar != "{"  && $lastChar != "}" && $lastChar != ","  && $lastChar != ";"))
        {
            $outStyle .= $char;
            $lastChar = $char;
        }
        
        
    }

	$outStyle = processCSSURLs($outStyle, $basePath);

    return $outStyle;
}

function getImageData($src)
{
	$p = pathinfo($src);
	$image = file_get_contents("./".$src);
	if ($p["extension"] == "png")
	{
		return "data:image/png;base64,".base64_encode($image);
	}
	if ($p["extension"] == "gif")
	{
		return "data:image/gif;base64,".base64_encode($image);
	}
	if ($p["extension"] == "jpg" || $p["extension"] == "jpeg")
	{
		return "data:image/jpeg;base64,".base64_encode($image);
	}
	if ($p["extension"] == "ico")
	{
		return "data:image/vnd.microsoft.icon;base64,".base64_encode($image);
	}

	return $src;
}

function getManifestData($src)
{
	$data = file_get_contents("./".$src);
    return "data:application/manifest+json;base64,".base64_encode($data);
}

if ($argc > 1)
{
    echo "Working dir: ".$argv[1].PHP_EOL;
    chdir($argv[1]);
}
$files = glob("*.htm");
foreach ($files as $file)
{
    $pi = pathinfo($file);

    if (strpos($file, ".merged") === FALSE && !file_exists($pi['dirname']."/".$pi['filename'].".splited.".$pi['extension']))
    {
        echo "Found file '".$file."'".PHP_EOL;
        $dom = new DOMDocument('1.0', 'UTF-8');
        $dom->preserveWhiteSpace = false;
        $dom->formatOutput = true;
        @$dom->loadHTML(file_get_contents($file), LIBXML_NOBLANKS);

        $objects = $dom->getElementsByTagName("link");
		$objectsList = [];
		foreach ($objects as $object)
		{
			$objectsList[] = $object;
		}
		//echo "STYLES: ".count($objects);
		$toDelete = [];
        foreach ($objectsList as $object)
        {
            $rel = strtolower($object->getAttribute("rel"));
            $src = $object->getAttribute("href");
			//echo "  STYLE '".$src."'".PHP_EOL;
            if ($rel == "stylesheet")
            {
                echo "  Processing style '".$src."'... ";
				$csspi = pathinfo("./".$src);
                $style = file_get_contents("./".$src);
                $styleElement = $dom->createElement("style", compactCSS($style, $pi["dirname"]."/"));
				$styleElement->setAttribute("i", "1");
                $object->parentNode->insertBefore($styleElement, $object);
                //$object->parentNode->removeChild($object);
				$toDelete[] = $object;
                echo "OK".PHP_EOL;
            }

			if ($rel == "icon" && strpos($src, "data:") === FALSE)
			{
				echo "  Processing icon '".$src."'... ";
				$object->setAttribute("href", getImageData($src));
				echo "OK".PHP_EOL;
			}

            if ($rel == "manifest" && strpos($src, "data:") === FALSE)
			{
				echo "  Processing manifest '".$src."'... ";
				//$object->setAttribute("href", getManifestData($src));
				echo "OK".PHP_EOL;
			}
        }

        $objects = $dom->getElementsByTagName("img");
		$objectsList = [];
		foreach ($objects as $object)
		{
			$objectsList[] = $object;
		}
		//echo "STYLES: ".count($objects);
		//$toDelete = [];
        foreach ($objectsList as $object)
        {
            $src = $object->getAttribute("src");

			if (strpos($src, "data:") === FALSE)
			{
				echo "  Processing image '".$src."'... ";
				$object->setAttribute("src", getImageData($src));
				echo "OK".PHP_EOL;
			}
        }


		$objects = $dom->getElementsByTagName("style");
		$objectsList = [];
		foreach ($objects as $object)
		{
			$objectsList[] = $object;
		}
		foreach ($objectsList as $object)
        {
			if ($object->getAttribute("i") != "1")
			{
				echo "  Processing inline style... ";
				$object->nodeValue = compactCSS($object->nodeValue);
				echo "OK".PHP_EOL;
			}
			else
			{
				$object->removeAttribute("i");
			}
		}

        $objects = $dom->getElementsByTagName("script");
		$objectsList = [];
		foreach ($objects as $object)
		{
			$objectsList[] = $object;
		}
        foreach ($objectsList as $object)
        {
            $src = $object->getAttribute("src");
            if (strlen($src) > 0)
            {
                echo "  Processing script '".$src."'... ";
                $script = file_get_contents("./".$src);
                $styleElement = $dom->createElement("script");
				$styleElement->appendChild($dom->createTextNode(compactJS($script)));
                $object->parentNode->insertBefore($styleElement, $object);
                //$object->parentNode->removeChild($object);
				$toDelete[] = $object;
                echo "OK".PHP_EOL;
            }
            else
            {
                echo "  Processing inline script... ";
				$js = $object->nodeValue;
				$object->nodeValue = "";
                $object->appendChild($dom->createTextNode(compactJS($js)));
                echo "OK".PHP_EOL;
            }
        }

		foreach ($toDelete as $object)
        {
			$object->parentNode->removeChild($object);
		}

        if (strpos($file, ".splited") === FALSE)
        {
            $newFile = $pi['dirname']."/".$pi['filename'].".merged.".$pi['extension'];
        }
        else
        {
            $newFile = str_replace(".splited", "", $file);
        }

        file_put_contents($newFile, "<!DOCTYPE html>".$dom->saveHTML($dom->documentElement));
        echo "Saved: '".$file."' => '".$newFile."'".PHP_EOL;
    }
}

?>