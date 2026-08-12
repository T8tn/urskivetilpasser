# Urskive tilpasser

<!DOCTYPE html>
<html lang="no">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Urskive Konfigurator</title>
    <style>
        :root {
            --bg-color: #121212;
            --panel-bg: #1e1e1e;
            --text-color: #ffffff;
            --accent-color: #3b82f6;
            --accent-hover: #2563eb;
            --border-color: #333333;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        body {
            background-color: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 1200px;
            background-color: var(--panel-bg);
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            border: 1px solid var(--border-color);
        }

        @media (min-width: 768px) {
            .container {
                flex-direction: row;
            }
        }

        .canvas-section {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 30px;
            background-color: #0a0a0a;
            position: relative;
        }

        .canvas-wrapper {
            position: relative;
            width: 400px;
            height: 400px;
            max-width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.8);
            cursor: grab;
        }

        .canvas-wrapper:active {
            cursor: grabbing;
        }

        canvas {
            display: block;
            width: 100%;
            height: 100%;
        }

        .control-panel {
            width: 100%;
            max-width: 450px;
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow-y: auto;
            max-height: 90vh;
        }

        @media (min-width: 768px) {
            .control-panel {
                border-left: 1px solid var(--border-color);
            }
        }

        h2 {
            font-size: 1.5rem;
            margin-bottom: 5px;
            font-weight: 600;
        }

        .control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        label {
            font-size: 0.9rem;
            color: #b0b0b0;
            font-weight: 500;
        }

        .checkbox-group {
            flex-direction: row;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            padding: 10px 0;
        }

        .checkbox-group input {
            width: 20px;
            height: 20px;
            accent-color: var(--accent-color);
            cursor: pointer;
        }

        input[type="range"] {
            width: 100%;
            accent-color: var(--accent-color);
            height: 6px;
            background: var(--border-color);
            border-radius: 3px;
            outline: none;
        }

        input[type="file"] {
            display: none;
        }

        .file-upload-btn {
            background-color: #2a2a2a;
            border: 1px dashed var(--border-color);
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            cursor: pointer;
            transition: background-color 0.2s, border-color 0.2s;
            font-weight: 500;
        }

        .file-upload-btn:hover {
            background-color: #333333;
            border-color: var(--accent-color);
        }

        .btn {
            background-color: var(--accent-color);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
            text-align: center;
        }

        .btn:hover {
            background-color: var(--accent-hover);
        }

        .btn:active {
            transform: scale(0.98);
        }

        .btn-secondary {
            background-color: #333333;
        }

        .btn-secondary:hover {
            background-color: #444444;
        }

        .form-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
            border-top: 1px solid var(--border-color);
            padding-top: 20px;
            margin-top: 10px;
        }

        .form-control {
            background-color: #121212;
            border: 1px solid var(--border-color);
            padding: 10px 14px;
            border-radius: 8px;
            color: white;
            font-size: 0.95rem;
            outline: none;
            width: 100%;
        }

        .form-control:focus {
            border-color: var(--accent-color);
        }

        textarea.form-control {
            resize: vertical;
            min-height: 80px;
        }
    



    


        
        


            


                


            


        



        
        


            

Urskive Konfigurator


            

Tilpass din unike klokke i sanntid.



            
            


                
                    
                    Hvit urskive (Sorte punktmarkeringer)
                
            



            
            


                Bakgrunnsbilde for urskive
                Velg bilde fra enhet...
                
            



            
            


                


                    Rotasjon
                    0°
                


                
            



            
            


                


                    Størrelse
                    400 px
                


                
            



            
            


                Nullstill bilde
                Last ned PNG
            



            
            @gmail.com" method="POST" enctype="multipart/form-data">
                
                
                
                
                

                

Send inn ditt design


                
                


                    
                


                
                


                    
                


                
                


                    
                


                
                


                    
                



                Send design

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://urskivetilpasser.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/87f12424-0428-419c-b73b-1113eb36debd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
