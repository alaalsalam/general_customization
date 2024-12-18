// Copyright (c) 2024, mhmed rjb and contributors
// For license information, please see license.txt

frappe.query_reports["general ledger with items"] = {
  filters: [
    {
      fieldname: "company",
      label: __("Company"),
      fieldtype: "Link",
      options: "Company",
      default: frappe.defaults.get_user_default("Company"),
      reqd: 1,
    },
    {
      fieldname: "finance_book",
      label: __("Finance Book"),
      fieldtype: "Link",
      options: "Finance Book",
    },
    {
      fieldname: "from_date",
      label: __("From Date"),
      fieldtype: "Date",
      default: frappe.datetime.add_months(frappe.datetime.get_today(), -1),
      reqd: 1,
      width: "60px",
    },
    {
      fieldname: "to_date",
      label: __("To Date"),
      fieldtype: "Date",
      default: frappe.datetime.get_today(),
      reqd: 1,
      width: "60px",
    },
    {
      fieldname: "account",
      label: __("Account"),
      fieldtype: "MultiSelectList",
      options: "Account",
      get_data: function (txt) {
        return frappe.db.get_link_options("Account", txt, {
          company: frappe.query_report.get_filter_value("company"),
        });
      },
    },
    {
      fieldname: "voucher_no",
      label: __("Voucher No"),
      fieldtype: "Data",
      on_change: function () {
        frappe.query_report.set_filter_value(
          "group_by",
          "Group by Voucher (Consolidated)"
        );
      },
    },
    {
      fieldname: "against_voucher_no",
      label: __("Against Voucher No"),
      fieldtype: "Data",
    },
    {
      fieldtype: "Break",
    },

    {
      fieldname: "party_type",
      label: __("Party Type"),
      fieldtype: "MultiSelectList",
      options: Object.keys(frappe.boot.party_account_types),
      on_change: function () {
        frappe.query_report.set_filter_value("party", "");
      },
    },
    //TODO: make commen party option

    {
      fieldname: "party",
      label: __("Party"),
      fieldtype: "MultiSelectList",
      get_data: function (txt) {
        if (!frappe.query_report.filters) return;

        let party_types = frappe.query_report.get_filter_value("party_type");
        if (!party_types || party_types.length === 0) return;

        // Fetch link options for all selected party types
        let promises = party_types.map((party_type) =>
          frappe.db.get_link_options(party_type, txt)
        );
        return Promise.all(promises).then((results) => [].concat(...results));
      },
      on_change: function () {
        let party_types = frappe.query_report.get_filter_value("party_type");
        let parties = frappe.query_report.get_filter_value("party");

        if (
          !party_types ||
          party_types.length === 0 ||
          parties.length === 0 ||
          parties.length > 1
        ) {
          frappe.query_report.set_filter_value("party_name", "");
          frappe.query_report.set_filter_value("tax_id", "");
          return;
        }

        // Assuming only one party is selected
        let party = parties[0];
        let party_type = party_types.length === 1 ? party_types[0] : null;

        if (party_type) {
          let fieldname = erpnext.utils.get_party_name(party_type) || "name";
          frappe.db.get_value(party_type, party, fieldname, function (value) {
            frappe.query_report.set_filter_value(
              "party_name",
              value[fieldname]
            );
          });

          if (party_type === "Customer" || party_type === "Supplier") {
            frappe.db.get_value(party_type, party, "tax_id", function (value) {
              frappe.query_report.set_filter_value("tax_id", value["tax_id"]);
            });
          }
        }
      },
    },
    {
      fieldname: "party_name",
      label: __("Party Name"),
      fieldtype: "Data",
      hidden: 1,
    },
    {
      fieldname: "group_by",
      label: __("Group by"),
      fieldtype: "Select",
      options: [
        "",
        {
          label: __("Group by Voucher"),
          value: "Group by Voucher",
        },
        {
          label: __("Group by Voucher (Consolidated)"),
          value: "Group by Voucher (Consolidated)",
        },
        {
          label: __("Group by Account"),
          value: "Group by Account",
        },
        {
          label: __("Group by Party"),
          value: "Group by Party",
        },
      ],
      default: "Group by Voucher (Consolidated)",
    },
    {
      fieldname: "tax_id",
      label: __("Tax Id"),
      fieldtype: "Data",
      hidden: 1,
    },
    {
      fieldname: "presentation_currency",
      label: __("Currency"),
      fieldtype: "Select",
      options: erpnext.get_presentation_currency_list(),
    },
    {
      fieldname: "cost_center",
      label: __("Cost Center"),
      fieldtype: "MultiSelectList",
      get_data: function (txt) {
        return frappe.db.get_link_options("Cost Center", txt, {
          company: frappe.query_report.get_filter_value("company"),
        });
      },
    },
    {
      fieldname: "project",
      label: __("Project"),
      fieldtype: "MultiSelectList",
      get_data: function (txt) {
        return frappe.db.get_link_options("Project", txt, {
          company: frappe.query_report.get_filter_value("company"),
        });
      },
    },
    {
      fieldname: "include_dimensions",
      label: __("Consider Accounting Dimensions"),
      fieldtype: "Check",
      default: 1,
    },
    {
      fieldname: "show_opening_entries",
      label: __("Show Opening Entries"),
      fieldtype: "Check",
    },
    {
      fieldname: "include_default_book_entries",
      label: __("Include Default FB Entries"),
      fieldtype: "Check",
      default: 1,
    },
    {
      fieldname: "show_cancelled_entries",
      label: __("Show Cancelled Entries"),
      fieldtype: "Check",
    },
    {
      fieldname: "show_net_values_in_party_account",
      label: __("Show Net Values in Party Account"),
      fieldtype: "Check",
    },
    {
      fieldname: "add_values_in_transaction_currency",
      label: __("Add Columns in Transaction Currency"),
      fieldtype: "Check",
    },
    {
      fieldname: "show_remarks",
      label: __("Show Remarks"),
      fieldtype: "Check",
    },
    {
      fieldname: "ignore_err",
      label: __("Ignore Exchange Rate Revaluation Journals"),
      fieldtype: "Check",
    },
    {
      fieldname: "show_item_details",
      label: __("show item details"),
      fieldtype: "Check",
    },
    {
      fieldname: "allow_common_party",
      label: __("Allow Commen Party"),
      fieldtype: "Check",
      default: 1,
      read_only: 1,
    },
  ],

  // Add dimensions for the General Ledger report

  // Function to show a message when the report is loaded
  onload: function (report) {
    if (allow_common_party) {
      console.log("Saiyed coming soon");
      // existing code
    }

    frappe.msgprint({
      title: __("Report Notice"),
      indicator: "orange",
      message: __("Note: This report still in beta version."),
    });
  },
};

erpnext.utils.add_dimensions("general ledger with items", 15);
