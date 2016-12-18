<html>
<body>
<?php
 
  set_time_limit(0);
  while (@ob_end_flush()) {}
  ob_implicit_flush(1);
 
  $i=1;
  while(true) {
    echo "<script>parent.handleDigit($i)</script>";
    sleep(1);
    $i++;
  }
 
?>
</body>
</html>