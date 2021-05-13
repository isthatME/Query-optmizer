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

  form: FormGroup;

  //variaveis para exibição
  projecaoPrincipal: string;
  juncoes = [];
  tabelas = []

  splitedString: string[];
  operations = []
  query: string =
    `SELECT USUARIO.NOME, USUARIO.CEP,NUMERO  FROM  USUARIO 
    JOIN CONTAS  
    ON CONTAS.USUARIO_IDUSUARIO = USUARIO.IDUSUARIO
    WHERE NUMERO > 10 AND BAIRRO > 'CENTRO' AND SALDOINICIAL = 0
    ORDER BY BAIRRO, NUMERO, NOME`

  query2: string =
    `SELECT USUARIO.NOME, USUARIO.CEP,NUMERO  FROM  USUARIO 
  WHERE NUMERO > 10 AND BAIRRO > 'CENTRO'
  ORDER BY BAIRRO, NUMERO, NOME`

  ngOnInit() {
    this.form = this.fb.group({
      query: [null, Validators.required]
    })
    this.analizadorLexico(this.query2);
  }

  onSubmit(form: FormGroup) {
  }

  verificadorDeQuery(campos, tabelas): boolean {
    var tableInc = 0;
    var fieldInc = 0;


    tabelas.forEach(tabela => {
      this.tables.map(elem => {
        if (elem.nome == tabela) tableInc++
      })
    });

    campos.forEach(campo => {
      // caso haja especificação da tabela no campo a ser projetado, damos um split e pegamos apenas o nome do campo, ex: USUARIO.NOME obteremos apenas NOME
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
    var camposSelect = []
    var joins = []
    var wheres = []
    var orders = []

    // Pega tabelas da query
    this.splitedString.map((item, index) => {
      if (item == "FROM") {
        this.tabelas.push(this.splitedString[index + 1])
      } else if (item == "JOIN") {
        this.tabelas.push(this.splitedString[index + 1])
      }
    })

    // Verifica se a query inicia com "SELECT"
    if (this.splitedString[0].toUpperCase() == 'SELECT') {
      var i = 1
      var j = 1
      // Pega os campos do "SELECT" até o "FROM"
      while (this.splitedString[i].toUpperCase() != "FROM") {
        campos.push(this.splitedString[i].toUpperCase())
        camposSelect.push(this.splitedString[i].toUpperCase())
        i++;
      }

      // Analisa a query após o "FROM"
      while (i < this.splitedString.length) {

        // Pega os "JOIN" da query
        if (this.splitedString[i].toUpperCase() == "JOIN") {
          joins.push(this.splitedString[i + 1].toUpperCase().trim() + " " +
            this.splitedString[i + 2].toUpperCase().trim() + " " +
            this.splitedString[i + 3].toUpperCase().trim() + " " +
            this.splitedString[i + 4].toUpperCase().trim() + " " +
            this.splitedString[i + 5].toUpperCase().trim()
          )
          // Pega os campos que são usados para fazer o join
          campos.push(this.splitedString[i + 3].toUpperCase().trim().split('.')[1])
          campos.push(this.splitedString[i + 5].toUpperCase().trim().split('.')[1])
        }

        // Pega os "WHERE" da query
        if (this.splitedString[i].toUpperCase() == "WHERE" || this.splitedString[i].toUpperCase() == "AND") {
          wheres.push(this.splitedString[i + 1].toUpperCase() + " " +
            this.splitedString[i + 2].toUpperCase().trim() + " " +
            this.splitedString[i + 3].toUpperCase().trim()
          )
        }

        // Pega os "ORDER" da query
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

    var tableJoins = []
    var tableProjections = []
    var tableSelects = []
    var orderedSelects = []

    // Monta array com os joins
    joins.map(join => {
      let splitedJoin = join.trim().split(" ")
      let tabela1 = splitedJoin[2].split(".")[0]
      let campo1 = splitedJoin[2].split(".")[1]
      let tabela2 = splitedJoin[4].split(".")[0]
      let campo2 = splitedJoin[4].split(".")[1]
      tableJoins.push(tabela1 + " |X| " + campo1 + " = " + campo2 + " " + tabela2)
    })

    // Descobrindo tabela de cada where
    wheres.map(where => {
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

      // Ordenando selects pelo operador mais restritivo      
      if (where.split(' ')[1] == '=') {
        orderedSelects.unshift({ where: where.split(' ')[0] + ' ' + where.split(' ')[1] + ' ' + where.split(' ')[2], tabela: tabela })
      } else {
        orderedSelects.push({ where: where.split(' ')[0] + ' ' + where.split(' ')[1] + ' ' + where.split(' ')[2], tabela: tabela })
      }
      this.tabelas = []
      // ordenando tabelas de prioridade do select 
      orderedSelects.map(select => { if (!this.tabelas.find(tabelaExistente => tabelaExistente == select.tabela)) this.tabelas.push(select.tabela) })
    })

    // Montando array com cada select e sua respectiva tabela
    orderedSelects.map(e => {
      tableSelects.push({ tabela: e.tabela, select: e.where })
    })

    // Montando array com cada projection e sua respectiva tabela
    campos.map(c => {
      let splitedCampo = c.split(" ")
      let campo = splitedCampo[0]
      if (campo.split('.').length == 2) {
        campo = campo.split('.')[1]
      }
      this.tables.forEach(table => {
        table.tabela.forEach(campoTabela => {
          if (campo == campoTabela) {
            tableProjections.push({ tabela: table.nome, campo: campo })
          }
        })
      });
    })

    // Montando cada tabela com seus selects e projeções
    this.tabelas.map((tabela, i) => {

      // Preparando os selects da tabela
      var select = ''
      tableSelects.forEach((table, index) => {
        if (table.tabela == tabela) {
          select = select + table.select + ' '
        }
      })

      // Preparando as projections da tabela
      var projection = ''
      tableProjections.forEach((table, index) => {
        if (table.tabela == tabela) {
          projection = projection + table.campo + ' '
        }
      })

      this.operations[i] = ({ tabela: tabela, selects: 'SIGMA ( ' + select + ')', projections: 'PI ( ' + projection + ')' })
    })

    // Montando projeção dos campos que estão no SELECT da query
    this.projecaoPrincipal = 'PI ('
    camposSelect.map(e => {
      if (e.split('.')[1]) {
        this.projecaoPrincipal = this.projecaoPrincipal + ' ' + e.split('.')[1]
      } else {
        this.projecaoPrincipal = this.projecaoPrincipal + ' ' + e
      }
    })
    this.projecaoPrincipal = this.projecaoPrincipal + ' )'
    if (tableJoins.length != 0) {
      tableJoins.map(join => {
        this.juncoes.push({ join: join, operacoes: this.operations })
      })
    } else {
      this.juncoes.push({ join: null, operations: this.operations })
    }

    console.log(this.juncoes)
  }
}

