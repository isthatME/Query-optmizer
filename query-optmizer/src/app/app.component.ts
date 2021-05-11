import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tabela } from 'src/models/table';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'query-optmizer';
  constructor(private fb: FormBuilder) { }

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

  ordemOperacoes = []
  form: FormGroup;

  //variaveis para exibição
  projecaoPrincipal: string;
  juncoes = [];
  tabelas = []

  splitedString: string[];
  selects = []
  selectsFiltered = [];
  query: string =
    `SELECT USUARIO.NOME, USUARIO.CEP,NUMERO  FROM  USUARIO 
    JOIN CONTAS  
    ON CONTAS.USUARIO_IDUSUARIO = USUARIO.IDUSUARIO
    WHERE NUMERO > 10 AND BAIRRO = 'CENTRO' AND SALDOINICIAL = 0
    ORDER BY BAIRRO, NUMERO, NOME`

  ngOnInit() {
    this.analizadorLexico(this.query);
    this.form = this.fb.group({
      query: [null, Validators.required]
    })
  }
  onSubmit(form: FormGroup) {
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
          if (tabelas[i] == campo.split('.')[0]) {
            tabelaValida = true
            break;
          }
        };

        if (tabelaValida) {
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
    var campos = []
    var joins = []
    var wheres = []
    var orders = []
    this.selectsFiltered = Array(this.tabelas.length).fill(null)
    this.splitedString.map((item, index) => {
      if (item == "FROM") {
        this.tabelas.push(this.splitedString[index + 1])
      } else if (item == "JOIN") {
        this.tabelas.push(this.splitedString[index + 1])
      }
    })

    if (this.splitedString[0].toUpperCase() == 'SELECT') {
      var i = 1
      var j = 1
      while (this.splitedString[i].toUpperCase() != "FROM") {
        campos.push(this.splitedString[i].toUpperCase())
        i++;
      }

      while (i < this.splitedString.length) {
        if (this.splitedString[i].toUpperCase() == "JOIN") {
          joins.push(this.splitedString[i + 1].toUpperCase().trim() + " " +
            this.splitedString[i + 2].toUpperCase().trim() + " " +
            this.splitedString[i + 3].toUpperCase().trim() + " " +
            this.splitedString[i + 4].toUpperCase().trim() + " " +
            this.splitedString[i + 5].toUpperCase().trim()
          )
        }

        if (this.splitedString[i].toUpperCase() == "WHERE" || this.splitedString[i].toUpperCase() == "AND") {
          wheres.push(this.splitedString[i + 1].toUpperCase() + " " +
            this.splitedString[i + 2].toUpperCase().trim() + " " +
            this.splitedString[i + 3].toUpperCase().trim()
          )
        }

        if (this.splitedString[i].toUpperCase() == "ORDER") {
          i += 2
          while (i < this.splitedString.length) {
            orders.push(this.splitedString[i].toUpperCase().trim())
            i++;
          }
          break;
        }
        i++;
      }
    }

    //OPERACOES

    var obj = []
    wheres.map(where => {
      // console.log(where)
      let splitedWhere = where.split(" ")
      let campo = splitedWhere[0]
      if (campo.split('.').length == 2) {
        campo = campo.split('.')[1]
      }
      let tabela = ""
      this.tables.forEach(table => {
        table.tabela.forEach(campoTabela => {
          if (campo == campoTabela) {
            tabela = table.nome
          }
        })
      });
      this.ordemOperacoes.push({ select: { campo: where, tabela: tabela }, join: null, projecao: null })

      this.tabelas.map((tab, index) => {
        if (tabela == tab) {
          obj.push({ tabela: tabela, condicao: where })
        }
      })
      if (where.split(' ')[1] == '=') {
        this.selects.unshift({ campo: where.split(' ')[0], operador: where.split(' ')[1], operando: where.split(' ')[2], tabela: tabela })
      } else {

        this.selects.push({ campo: where.split(' ')[0], operador: where.split(' ')[1], operando: where.split(' ')[2], tabela: tabela })
      }
    })
    this.tabelas.map((e, i) => {
      var condicao = ''
      obj.forEach((elem, index) => {
        if (elem.tabela == e) {
          condicao = condicao + elem.condicao + ' '
        }
      })
      this.selectsFiltered[i] = ({ tabela: e, condicao: condicao })
    })
    joins.map(join => {
      let splitedJoin = join.trim().split(" ")
      let tabela1 = splitedJoin[2].split(".")[0]
      let campo1 = splitedJoin[2].split(".")[1]
      let tabela2 = splitedJoin[4].split(".")[0]
      let campo2 = splitedJoin[4].split(".")[1]
      this.ordemOperacoes.push({ select: null, join: tabela1 + " |X| " + campo1 + " = " + campo2 + " " + tabela2, projecao: null })
      this.ordemOperacoes.push({ select: null, join: null, projecao: { campo: campo1, tabela: tabela1 } })
      this.ordemOperacoes.push({ select: null, join: null, projecao: { campo: campo2, tabela: tabela2 } })
    })
    campos.map(c => {
      let splitedCampo = c.split(" ")
      let campo = splitedCampo[0]
      if (campo.split('.').length == 2) {
        campo = campo.split('.')[1]
      }
      this.tables.forEach(table => {
        table.tabela.forEach(campoTabela => {
          if (campo == campoTabela) {
            this.ordemOperacoes.push({ select: null, join: null, projecao: { campo: campo, tabela: table.nome } })
          }
        })
      });

    })
    // console.log(this.ordemOperacoes)
    this.projecaoPrincipal = ''
    campos.map(e => {
      if (e.split('.')[1]) {
        this.projecaoPrincipal = this.projecaoPrincipal + ' ' + e.split('.')[1]
      } else {
        this.projecaoPrincipal = this.projecaoPrincipal + ' ' + e
      }
    })
    let objCamposTabela = {}
    this.ordemOperacoes.map(e => {
      if (e.join) this.juncoes.push({join: e.join, campos: this.selectsFiltered})
    })

    console.log(this.juncoes)
    console.log(this.ordemOperacoes)
  }
}

