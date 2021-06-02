const fs = require('fs');
const prompt = require('prompt');


const FTP_SCRIPT_FILE_NAME = "./generated-files/ftp.bat"

main()

async function main() {
    const credentials = await getFTPCredentials()
    // Usar lógica da função acima para receber o caminho das pastas que ficarão os arquivos no pc local e no FTP
    const folderPaths = await getFTPFolderPaths()
    const FTPScriptFileContent = getFTPScript(credentials, folderPaths)
    await saveScriptFile(FTPScriptFileContent)

    // Usar a lógica das funções acima para fazer o script que agenda a tarefa no windows
    await saveScriptToCreateWindowsTask()
}

async function getFTPCredentials(){
    return new Promise((resolve, reject)=>{
        const properties = [
            {
                name: 'username',
            },
            {
                name: 'password',
            }
        ];
        prompt.start();

        prompt.get(properties, function (err, result) {
            if (err) { reject(err) }
            console.log('Command-line input received:');
            console.log('  Username: ' + result.username);
            console.log('  Password: ' + result.password);
            resolve(result)
        });
    })
}
async function getFTPFolderPaths(){
    //Fazer igual a função anterior, para o usuário digitar
    return {
        localFolderPath: 'C:\EDI\DIRETALOG-MG',
        serverFolderPath: 'NOTFIS-MG'
    }
}
function getFTPScript(credentials, folderPaths) {
    // Aqui falta colocar os textos de forma dinamica. Um exemplo é a linha 53
    return `
        @echo off
        setlocal enableDelayedExpansion 
        cd ${folderPaths.localFolderPath}
        mkdir ftpToUpload

        set MYDIR=C:\EDI\DIRETALOG-MG\NOTFIS\*.txt

        for /F %%x in ('dir /B/D %MYDIR%') do (
            set FILENAME=%%x
            echo winscp.com /command "open ftp://23123.loggi:2xHTQc32222222h]U@FTP.asdaasd.XYZ" ^^> ftpToUpload/!FILENAME!.bat
            echo     "lcd C:\EDI\DIRETALOG-MG\NOTFIS" ^^>> ftpToUpload/!FILENAME!.bat
            echo     "option batch continue" ^^>> ftpToUpload/!FILENAME!.bat
            echo     "put !FILENAME! NOTFIS-MG/" ^^^^>> ftpToUpload/!FILENAME!.bat
            echo     "exit">> ftpToUpload/!FILENAME!.bat

            echo ===========================  Search in !FILENAME! ===========================
        )

        set MYDIR=C:\EDI\DIRETALOG-MG\ftpToUpload
        cd ftpToUpload
        for /F %%x in ('dir /B/D %MYDIR%') do (
            set FILENAME=%%x
            call !FILENAME! 
            del !FILENAME! /q >nul
        )
        cd ..
        rd /s/q ftpToUpload

        set MYDIR=C:\EDI\DIRETALOG-MG\NOTFIS\*.txt

        for /F %%x in ('dir /B/D %MYDIR%') do (
            set FILENAME=%%x
            move NOTFIS\!FILENAME! NOTFIS\enviados
        )
    `
}

async function saveScriptFile(FTPScriptFileContent) {
    return new Promise((resolve, reject) => {
        fs.appendFile(FTP_SCRIPT_FILE_NAME, FTPScriptFileContent, function (err) {
            if (err) throw reject(err);
            resolve()
        });
    })
}