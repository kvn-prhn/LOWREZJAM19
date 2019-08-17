

<?php
    header("Content-Type: text/plain"); 
    header("Access-Control-Allow-Origin: *"); // TODO: need to specify the on-server host  
    
    $key = $_POST['key']; 
    if (isset($key)) {
        echo '<h3>' . strtoupper($key) . '</h3>';
    }
    switch($key) {
        case "start":
            echo '<p>';
            echo 'To get past the instructions page please type';
            echo '</p>';
            echo '<p>';
            echo 'J U I C E';
            echo '</p>';
            echo '<p>';
            echo 'You can close this window.';
            echo '</p>';
            break; 
        case "help":
            echo "<p>Press SPACE to pull slot machine arm</p>";
            echo "<p>Press RIGHT ARROW to jiggle right</p>";
            echo "<p>Press LEFT ARROW to jiggle left</p>";
            echo "<p>Type ANY LETTERS to spell words</p>";
            echo "<p>If the slot machine is stuck, sometimes jiggling it can make it unstuck</p>";
            echo "<p>Some typed words only work once</p>";
            break;
        case "firstjackpot":
            echo "<p>Congratulations on your first jackpot!</p>";
            echo "<p>Keep this window open</p>";
            echo "<p>If you get another one, try jiggling the machine right 3 times</p>";
            break;
        case "jackpotbonus":
            echo '<p>Welcome to the jackpot bonus!</p>';
            echo '<p>Keep this window open</p>';
            echo '<p>You can awaken all ghosts by spamming "V"</p>';
            break;
        case "demon":
        case "enemy":
        case "sixsixsix":
            echo '<p>Careful</p>'; 
            echo '<p>Keep this window open</p>'; 
            echo '<p>Z M A L Q P</p>'; 
            break; 
        case "wincondition1":
            echo '<p>You have your first 3-of-a-kind</p>'; 
            echo '<p>Keep this window open</p>'; 
            echo '<p>Type this after the 4th 3-of-a-kind</p>'; 
            echo '<p>T G H Y U</p>'; 
            break; 
        case "missedwincondition1":
            echo '<p>You missed your chance</p>'; 
            echo '<p>No point in continuing</p>'; 
            echo '<p>Type R E S T A R T to retry</p>'; 
            break;
        case "gghostsrreal":
            echo '<p>Have you seen ghosts?</p>';
            echo '<p>Keep this window open</p>'; 
            echo '<p>You need the right message at the right time</p>'; 
            echo '<p>Wait for a 2-of-a-kind</p>'; 
            echo '<p>Z A Q W E</p>'; 
            break; 
        case "windcondition3":
            echo '<p>Almost there</p>';
            echo '<p>Summon the demon (if you haven\'t yet)</p>';
            echo '<p>Wait for it to make the slot machine stuck</p>';
            echo '<p>L K J H G</p>';
            break;
        case "pojfnsaudgwaowcbzsh":
            echo '<p>You made it congratulations</p>';
            echo '<p>Please enjoy this fine video celebrating your victory over the demon</p>';
            echo '<p>https://www.youtube.com/watch?v=dQw4w9WgXcQ</p>';
            break;
        case "outofmoney":
            echo '<p>You ran out of money</p>'; 
            echo '<p>You are very unlucky today</p>';  
            echo '<p>Type R E S T A R T to retry</p>'; 
            break; 
        default:
            echo "Something went wrong";
    }
?>

