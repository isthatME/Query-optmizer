import { Component, OnInit } from '@angular/core';
import { Tabela } from 'src/models/table';

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
  tables: Tabela[] = [
    { nome: "USUARIO", tabela: ['IDUSUARIO', 'NOME', 'LOGRADOURO', 'NUMERO', 'BAIRRO', 'CEP', 'UF', 'DATANASCIMENTO'] },
    { nome: "CONTAS", tabela: ['IDCONTA', 'DESCRICAO', 'TIPOCONTA_IDTIPOCONTA', 'USUARIO_IDUSUARIO', 'SALDOINICIAL'] },
    { nome: "TIPOCONTA", tabela: ['IDTIPOCONTA', 'DESCRICAO'] },
    { nome: "CATEGORIA", tabela: ['IDCATEGORIA', 'DESCCATEGORIA'] },
    { nome: "MOVIMENTACAO", tabela: ['IDMOVIMENTACAO', 'DATAMOVIMENTACAO', 'DESCRICAO', 'TIPOMOVIMENTO_IDTIPOMOVIMENTO', 'CATEGORIA_IDCATEGORIA', 'CONTAS_IDCONTA', 'VALOR'] },
    { nome: "TIPOMOVIMENTO", tabela: ['IDTIPOMOVIMENTO', 'DESCMOVIMENTACAO'] }
  ]

  isQueryValid: boolean;

  //variáveis
  splitedString: string[];
  query: string =
    `SELECT USUARIO.NOME, NUMERO, BAIRRO  FROM  USUARIO 
  JOIN CONTAS  
  ON CONTAS.USUARIO_IDUSUARIO == USUARIO.IDUSUARIO
  WHERE NUMERO = 10 AND BAIRO = 'CENTRO'
  ORDER BY BAIRRO, NUMERO, NOME`

  ngOnInit() {
    this.analizadorLexico(this.query);
  }
  verificadorDeQuery(campos, tabelas): boolean {
    var tableInc = 0;
    var fieldInc = 0;


    tabelas.forEach(tabela => {
      this.tables.map(elem => { if (elem.nome == tabela) tableInc++ })
    });

    campos.forEach(campo => {
      // caso haja especificação da tabela no campo a ser projetado, damos um split e pegamos apenas o nome da tabela, ex: USUARIO.NOME obteremos apenas NOME
      if (campo.split('.').length == 2) {
        var tabelaValida = false
        for (var i = 0; i < tabelas.length; ++i) {
          if(tabelas[i] == campo.split('.')[0]) {
            tabelaValida = true
            break;
          }
        };

        if(tabelaValida){
          this.tables.map(elem => elem.tabela.map(e => { if (e == campo.split('.')[1]) fieldInc++ }))
        }
      } else {
        this.tables.map(elem => elem.tabela.map(e => { if (e == campo) fieldInc++ }))
      }
    });
    return tableInc == tabelas.length && fieldInc == campos.length;
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
          joins.push(this.splitedString[i + 1].toUpperCase() + " " +
            this.splitedString[i + 2].toUpperCase() + " " +
            this.splitedString[i + 3].toUpperCase() + " " +
            this.splitedString[i + 4].toUpperCase() + " " +
            this.splitedString[i + 5].toUpperCase()
          )
        }

        if (this.splitedString[i].toUpperCase() == "WHERE" || this.splitedString[i].toUpperCase() == "AND") {
          wheres.push(this.splitedString[i + 1].toUpperCase() + " " +
            this.splitedString[i + 2].toUpperCase() + " " +
            this.splitedString[i + 3].toUpperCase()
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

      console.log('valido: ', this.verificadorDeQuery(campos, tabelas))
      console.log("joins: ", joins)
      console.log("wheres: ", wheres)
      console.log("orders: ", orders)
    }
  }

}

