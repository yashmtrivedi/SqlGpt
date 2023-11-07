const x = {
    "content": "SELECT employee_dimension.emp_name FROM   sales_fact join employee_dimension on sales_fact.emp_id = employee_dimension.emp_id GROUP BY employee_dimension.emp_id, employee_dimension.emp_name ORDER BY sum(sales_fact.total) DESC LIMIT 1;",
    "Rows": [
      {
        "Data": [
          {
            "VarCharValue": "employee_dimension.emp_name"
          }
        ]
      },
      {
        "Data": [
          {
            "VarCharValue": "Nitin Mishra"
          }
        ]
      }
    ]
  }

 const  x2 = {
    "Rows": [
      {
        "Data": [
          {
            "VarCharValue": "rd_region_id"
          },
          {
            "VarCharValue": "rd_region_name"
          },
          {
            "VarCharValue": "ed_emp_id"
          },
          {
            "VarCharValue": "ed_emp_name"
          },
          {
            "VarCharValue": "ed_title"
          },
          {
            "VarCharValue": "ed_department"
          },
          {
            "VarCharValue": "sf_total"
          },
          {
            "VarCharValue": "sf_quantity"
          },
          {
            "VarCharValue": "sf_discount"
          }
        ]
      }
    ],
    "content": "WITH region_dim AS (\\n    SELECT rd.region_id,\\n           rd.region_name\\n    FROM region_dimension rd\\n),\\nemployee_dim AS (\\n    SELECT ed.emp_id,\\n           ed.emp_name,\\n           ed.title,\\n           ed.department\\n    FROM employee_dimension ed\\n),\\nsales_fact AS (\\n    SELECT sf.region_id,\\n           sf.emp_id,\\n           sf.total,\\n           sf.quantity,\\n           sf.discount\\n    FROM sales_fact sf\\n)\\n\\nSELECT rd.region_id AS rd_region_id,\\n       rd.region_name AS rd_region_name,\\n       ed.emp_id AS ed_emp_id,\\n       ed.emp_name AS ed_emp_name,\\n       ed.title AS ed_title,\\n       ed.department AS ed_department,\\n       sf.total AS sf_total,\\n       sf.quantity AS sf_quantity,\\n       sf.discount AS sf_discount\\nFROM region_dim rd\\nJOIN employee_dim ed ON rd.region_id = ed.emp_id\\nJOIN sales_fact sf ON rd.region_id = sf.region_id AND ed.emp_id = sf.emp_id;"
  }