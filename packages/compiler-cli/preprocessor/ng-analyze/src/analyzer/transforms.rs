use oxc_ast::ast::Expression;

pub enum ExtractedTransformType {
    Type(oxc_span::Span),
    Expression(oxc_span::Span),
}

pub fn extract_transform_type(expr: &Expression<'_>) -> Option<ExtractedTransformType> {
    match expr {
        Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_) => {
            extract_transform_type_from_expr(expr).map(ExtractedTransformType::Type)
        }
        _ => {
            use oxc_span::GetSpan;
            Some(ExtractedTransformType::Expression(expr.span()))
        }
    }
}

fn extract_transform_type_from_expr(expr: &Expression<'_>) -> Option<oxc_span::Span> {
    let params = match expr {
        Expression::ArrowFunctionExpression(arrow) => &arrow.params,
        Expression::FunctionExpression(func) => &func.params,
        _ => return None,
    };
    transform_type_from_params(params)
}

pub fn transform_type_from_params(
    params: &oxc_ast::ast::FormalParameters<'_>,
) -> Option<oxc_span::Span> {
    use oxc_span::GetSpan;
    let param = params.items.first()?;
    let type_ann = param.type_annotation.as_ref()?;
    Some(type_ann.type_annotation.span())
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    #[test]
    fn test_extract_transform_type_inline_arrow() {
        let allocator = Allocator::default();
        let source_type = SourceType::ts();
        let ret = Parser::new(
            &allocator,
            "const arrow = (v: string | number) => v;",
            source_type,
        )
        .parse();
        let statement = &ret.program.body[0];
        let oxc_ast::ast::Statement::VariableDeclaration(var) = statement else {
            panic!("Expected variable declaration");
        };
        let expr = var.declarations[0].init.as_ref().unwrap();

        let res = extract_transform_type(expr).unwrap();
        let ExtractedTransformType::Type(span) = res else {
            panic!("Expected Type variant");
        };
        assert_eq!(
            span.source_text("const arrow = (v: string | number) => v;"),
            "string | number"
        );
    }

    #[test]
    fn test_extract_transform_type_reference() {
        let allocator = Allocator::default();
        let source_type = SourceType::ts();
        let ret = Parser::new(&allocator, "const ref = myTransform;", source_type).parse();
        let statement = &ret.program.body[0];
        let oxc_ast::ast::Statement::VariableDeclaration(var) = statement else {
            panic!("Expected variable declaration");
        };
        let expr = var.declarations[0].init.as_ref().unwrap();

        let res = extract_transform_type(expr).unwrap();
        let ExtractedTransformType::Expression(span) = res else {
            panic!("Expected Expression variant");
        };
        assert_eq!(span.source_text("const ref = myTransform;"), "myTransform");
    }
}
