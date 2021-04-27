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
  ON CONTAS.USUARIO_IDUSUARIO == USUARIO.IDUSUARIO
  WHERE NUMERO = 10 AND BAIRO = 'CENTRO'
  ORDER BY BAIRRO, NUMERO, NOME`

  ngOnInit() {
    this.analizadorLexico(this.query);
  }
  analizadorLexico(str) {
    this.splitedString = str.split(/,| /).filter(e => e != '' && e != '\n')
    let tabelas = []
    let campos = []
    let joins = []
    let wheres = []
    let orders = []
    this.splitedString.map((item, index) => {
      if (item == "FROM") {
        tabelas.push(this.splitedString[index + 1])
      } else if (item == "JOIN") {
        tabelas.push(this.splitedString[index + 1])
      }
    })
    console.log("tabelas: ", tabelas)

    if (this.splitedString[0].toUpperCase() == 'SELECT') {
      var i = 1
      var j = 1
      
      while (this.splitedString[i].toUpperCase() != "FROM") {
        campos.push(this.splitedString[i].toUpperCase())
        i++;
      }
      console.log("campos: ", campos)

      while (i < this.splitedString.length) {
        if (this.splitedString[i].toUpperCase() == "JOIN") {
          joins.push(this.splitedString[i+1].toUpperCase() + " " + 
                    this.splitedString[i+2].toUpperCase()  + " " +  
                    this.splitedString[i+3].toUpperCase()  + " " + 
                    this.splitedString[i+4].toUpperCase()  + " " +  
                    this.splitedString[i+5].toUpperCase()
          )
        }

        if (this.splitedString[i].toUpperCase() == "WHERE" || this.splitedString[i].toUpperCase() == "AND") {
          wheres.push(this.splitedString[i+1].toUpperCase() + " " + 
                    this.splitedString[i+2].toUpperCase()  + " " +  
                    this.splitedString[i+3].toUpperCase()
          )
        }

        if (this.splitedString[i].toUpperCase() == "ORDER") {
          i += 2
          while (i < this.splitedString.length) {
            orders.push(this.splitedString[i].toUpperCase())
            i++;
          }
          break;
        }
        i++;
      }

      console.log("joins: ", joins)
      console.log("wheres: ", wheres)
      console.log("orders: ", orders)
      
      // while (i < this.splitedString.length) {
      //   while (this.splitedString[j].toUpperCase() != "FROM") {
      //     palavras.push(this.splitedString[j].toUpperCase())
      //     j++;
      //     i++;
      //   }
      //   console.log(this.splitedString[j].toUpperCase())
      //   i++
      // }
      // console.log(palavras)
    }
  }

}
