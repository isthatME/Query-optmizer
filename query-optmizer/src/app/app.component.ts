import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'query-optmizer';

  operadores: string[] = ['=', '>', '<', '<=', '>=', '<', '>', 'AND', 'OR', 'IN', 'NOT IN', 'LIKE'];
  operacoes: string[] = ['SELECT', 'WHERE', 'JOIN', 'ORDER BY'];
  //tabelas
  tables: Object[] = [
    { nome: "USUARIO", tabela: ['IDUSUARIO', 'NOME', 'LOGRADOURO', 'NUMERO', 'BAIRRO', 'CEP', 'UF', 'DATANASCIMENTO'] },
    { nome: "CONTAS", tabela: ['IDCONTA', 'DESCRICAO', 'TIPOCONTA_IDTIPOCONTA', 'USUARIO_IDUSUARIO', 'SALDOINICIAL'] },
    { nome: "TIPOCONTA", tabela: ['IDTIPOCONTA', 'DESCRICAO'] },
    { nome: "CATEGORIA", tabela: ['IDCATEGORIA', 'DESCCATEGORIA'] },
    { nome: "MOVIMENTACAO", tabela: ['IDMOVIMENTACAO', 'DATAMOVIMENTACAO', 'DESCRICAO', 'TIPOMOVIMENTO_IDTIPOMOVIMENTO', 'CATEGORIA_IDCATEGORIA', 'CONTAS_IDCONTA', 'VALOR'] },
    { nome: "TIPOMOVIMENTO", tabela: ['IDTIPOMOVIMENTO', 'DESCMOVIMENTACAO'] }
  ]

  //variáveis
  splitedString: string[];
  query: string =
    `SELECT NOME, NUMERO, BAIRRO  FROM  USUARIO 
  JOIN CONTAS  
  ON CONTAS.USUARIO_IDUSUARIO == USUARIO.IDUSUARIO`

  ngOnInit() {
    this.analizadorLexico(this.query);
  }
  analizadorLexico(str) {
    this.splitedString = str.split(/,| /).filter(e => e != '' && e != '\n')
    let tabelas = []
    this.splitedString.map((item,index) => {
      if(item == "FROM"){
        tabelas.push(this.splitedString[index + 1])
      }else if(item == "JOIN"){
        tabelas.push(this.splitedString[index + 1])
      }
    })
    console.log(tabelas)
    // if (this.splitedString[0].toUpperCase() == 'SELECT') {
    //   var i = 1
    //   var j = 1
    //   while (i < this.splitedString.length) {
    //     while (this.splitedString[j].toUpperCase() != "FROM") {
    //       j++;
    //     }
        
    //     i++
    //   }
    //   console.log()
    // }
  }

}
