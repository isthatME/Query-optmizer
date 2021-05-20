# Query optmizer

A query optimizer based using some heuristics.

### Requirements

* [node.js](https://nodejs.org/en/download/)


### Setup


1. Clone the repo
```sh
git clone https://github.com/isthatME/Query-optmizer.git
```
2. Install NPM packages
```sh
npm install
```
3. Run the project
```JS
ng serve
```

## Example of an optimized query

Given the following query
```sh
SELECT USUARIO.NOME, USUARIO.CEP,NUMERO  FROM  USUARIO  
 JOIN CONTAS       
 ON CONTAS.USUARIO_IDUSUARIO = USUARIO.IDUSUARIO      
 WHERE NUMERO > 10 AND BAIRRO = CENTRO    ORDER BY BAIRRO, NUMERO, NOME
```
The result will be

<img height=500 width=1000 src="https://github.com/isthatME/Query-optmizer/blob/master/src/assets/example.png"/>


